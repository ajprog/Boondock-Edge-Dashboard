# Settings inventory and proposed ownership

This document records the current dashboard settings surface before any API or
state-management migration. It is an inventory and naming proposal, not an API
contract. The API migration, client state library, and implementation sequence
remain separate decisions.

## Scope rules

The proposed model has four owners:

1. **System settings** affect the edge server or every user and are readable only
   through an authorized category endpoint.
2. **Group creation defaults** provide the initial display and inbox values when
   a user is created in a group (the current `profile` concept). They are copied
   to the new user; they are not a runtime fallback or inherited live values.
3. **User preferences** are the resulting values owned by one user and returned
   as part of the current user.
4. **Browser state** contains intentionally device-specific choices such as
   `isDarkMode`, active channel filters, the inbox time range, and live mode.

Defaults are user-creation values, not lookup fallbacks. When an administrator
creates a user, the selected group's values are copied into that user's stored
preferences. Later group changes do not silently change existing users. Any
mandatory creation fallback belongs in the user-creation workflow, not in an
editable system-wide `defaults` category.

## Proposed first-level categories

System settings use a single category level:

- `transcription`
- `audioProcessing`
- `recorders`
- `wifi`
- `backup`
- `maintenance`
- `apiKeys`

User preferences and group creation defaults use:

- `display`
- `inbox`
- `reports`

Operational resources such as health, queue status, live streams, backup jobs,
logs, channels, and frequencies are not settings merely because their controls
currently appear on the Settings page.

## Current `/settings` fields

### Transcription

| Current name | Proposed name | Owner | Current use | Recommendation |
| --- | --- | --- | --- | --- |
| `global_target_language` | `targetLanguage` | System: `transcription` | Primary transcription language | Keep and rename. |
| `global_model` | `model` | System: `transcription` | Local faster-whisper model | Keep and rename. Save with the rest of the transcription form. |
| `global_transcribe_method` | `method` | System: `transcription` | Selects local or Boondock API transcription | Keep and rename. |
| `global_transcribe_node` | none | System: `transcription` | Loaded by `SettingsPage`, but no active control or consumer was found | Remove; confirmed obsolete. |
| `global_transcription_api_key` | `apiKeyConfigured` on reads; `apiKey` on writes | System: `transcription` | Credential for remote transcription | Do not return the key. A read reports whether one is configured; an authorized write may replace it. |

Suggested response shape:

```json
{
  "targetLanguage": "english",
  "model": "base.en",
  "method": "local",
  "apiKeyConfigured": true
}
```

### Audio processing and inbox content

| Current name | Proposed name | Owner | Current use | Recommendation |
| --- | --- | --- | --- | --- |
| `global_hallucination` | `showHallucinations` (invert the old value during migration) | Admin user: `inbox` | Controls whether matched hallucination text is visible in the inbox | Move to the admin user's preferences alongside duplicate visibility. Use the same positive `show…` semantics for both fields; non-admin users do not receive or control either field. |
| `global_show_duplicate_files` | `showDuplicateRecordings` | Admin user: `inbox` | Controls whether an administrator can see duplicate recordings | Move to the admin user's preferences. Non-admin users do not receive or control it. |
| Hallucination phrases from `/hallucinations` | `hallucinationPatterns` | System: `audioProcessing` | CRUD list used by post-processing | Keep as a collection with literal and regex matching modes. |
| `keywords` | `keywords` | Group data | Shared keyword-alert list returned by `/settings` and changed by dedicated keyword endpoints | Store on the renamed group resource. Return the user's relevant group data, including its keywords, with the current user. Do not copy keywords onto each user. |

The dashboard does perform hallucination matching in `FullscreenMessages`. For
`regex` entries it compiles the pattern with JavaScript's case-insensitive flag,
tests it for an indicator, and globally replaces matches with `.....` when
filtering is enabled. For `wildcard` entries it converts `*` to `.*` and `?` to
`.`; wildcard patterns are anchored to the entire transcription, while plain
patterns match anywhere. Invalid patterns are logged and skipped. The editor
posts `{ text, type: ['regex'] }` for every new entry, does not validate it, and
has unused `isRegex` and `isWildcard` state. The API/service may also process
these patterns, but that cannot be confirmed from this dashboard repository.

### Current keyword matching

Keyword behavior is currently inconsistent:

- Filtering selected keywords uses case-insensitive literal substring matching
  through `message.toLowerCase().includes(keyword.toLowerCase())`.
- Counts and highlighting construct `new RegExp(keyword, 'gi')`, so those paths
  interpret regex metacharacters and count every match.
- Keyword regex construction has no escaping or error handling; an invalid
  expression can interrupt the count/highlight path.
- Clicking a keyword only changes the current in-memory `activeKeywords` set.
  Active keyword selection is not persisted.

Keywords and hallucinations should use the same explicit matching contract:

```json
{
  "pattern": "engine fire",
  "matchType": "literal",
  "caseSensitive": false
}
```

`literal` with `caseSensitive: false` is the default for the common case.
`regex` remains available as an advanced option and must be validated before it
is saved. Counts, highlighting, filtering, and hallucination replacement must
all call the same matcher so a pattern never means different things in different
parts of the dashboard. Existing wildcard records can be migrated to equivalent
regex patterns rather than retaining a third matching language.

Advanced mode accepts any regex source supported by the agreed JavaScript
runtime; there is no planned syntax blacklist. Users do not provide raw flags:
`caseSensitive` controls `i`, and the matcher adds `g` internally only where all
matches are required. This avoids stateful or incompatible user-selected flags
while retaining the full expression syntax. Validate expressions on save and
set a reasonable pattern/input-length limit because syntactically valid nested
quantifiers can cause excessive backtracking (ReDoS). If the API evaluates the
patterns in a non-JavaScript regex engine, it must either use a shared compatible
engine or reject expressions it cannot execute identically.

### Recorder feature switches

| Current name | Proposed name | Owner | Current use | Recommendation |
| --- | --- | --- | --- | --- |
| `global_enable_uniden_scanners` | `unidenScannersEnabled` | System: `recorders` | Enables Uniden scanner discovery | Keep and rename if scanner support remains. |
| `global_enable_edge_devices` | `edgeRecordersEnabled` | System: `recorders` | Enables Boondock Edge discovery and controls recorder tabs | Keep and rename. |
| `global_enable_usb_audio_devices` | `usbRecordersEnabled` | System: `recorders` | Controls the USB recorder tab | Keep and rename if USB recorder support remains. |
| `global_live_mode_enabled` | `liveModeEnabled` | Browser state | Saves the dashboard live-audio mode globally today | Remove from system settings and persist in the browser alongside `isDarkMode`. |

Channels, frequencies, recorder devices, recorder firmware, scanner state, and
recorder health have their own APIs. They are domain resources, not fields in
the settings object.

### Wi-Fi

| Current name | Proposed name | Owner | Current use | Recommendation |
| --- | --- | --- | --- | --- |
| `host_ssid` | `ssid` | System: `wifi` | Hotspot SSID and recorder auto-configuration | Keep and rename. |
| `host_password` | `password` | System: `wifi` | Hotspot password | Keep for now; defer the configured-flag protocol change. |
| `host_ip` | `hostIp` | System: `wifi` | Host address advertised to recorders | Keep and rename. |
| `host_port` | `hostPort` | System: `wifi` | Host port advertised to recorders and used by recorder auto-configuration | Keep and rename. Fix the explicit Wi-Fi Save path, where writing this field is currently commented out. |

Hotspot status remains a separate `GET /hotspot/status` operational resource,
while start and stop remain commands. The Wi-Fi screen currently fetches status
once when mounted and again after start/stop; it does not continuously monitor
it. Whether to poll while the Wi-Fi screen is open is a later operational-data
decision. Status should not be folded into persisted configuration because it
can change independently of a settings save.

### Backup

The proposed backup object deliberately uses explicit field names rather than
nested `s3` and `samba` objects.

| Current name | Proposed name | Owner | Current use | Recommendation |
| --- | --- | --- | --- | --- |
| `global_enable_s3_upload` | `s3Enabled` | System: `backup` | Enables S3-compatible backup | Keep and rename. |
| `s3_endpoint_url` | `s3EndpointUrl` | System: `backup` | S3-compatible endpoint | Keep and rename. |
| `s3_access_key` | `s3AccessKey` | System: `backup` | S3 access credential | Keep for now; defer configured-flag protocol changes. |
| `s3_secret_key` | `s3SecretKey` | System: `backup` | S3 secret credential | Keep for now; defer configured-flag protocol changes. |
| `s3_region` | `s3Region` | System: `backup` | S3 region | Keep and rename. |
| `s3_bucket_name` | `s3BucketName` | System: `backup` | S3 bucket | Keep and rename. |
| `s3_backup_time` | none | System: `backup` | Scheduled S3 backup time | Remove; confirmed obsolete. Maintenance owns scheduling. |
| `samba_backup_enabled` | `sambaEnabled` | System: `backup` | Enables network-share backup | Keep and rename. |
| `samba_share_path` | `sambaSharePath` | System: `backup` | Network share path | Keep and rename. |
| `samba_username` | `sambaUsername` | System: `backup` | Network share username | Keep and rename. |
| `samba_password` | `sambaPassword` | System: `backup` | Network share password | Keep for now; defer configured-flag protocol changes. |

Backup start/status, restore listing/execution, and destination tests are
operations. They should stay outside the persisted backup settings response.

### Current global inbox values

| Current name | Proposed name | Owner | Current behavior | Recommendation |
| --- | --- | --- | --- | --- |
| `global_inbox_view_mode` | none | System setting | Loaded globally and applied to every dashboard | Remove. `recordsPerPage: 0` represents continuous scrolling. |
| `global_inbox_records_per_page` | `recordsPerPage` | Group creation default copied to the user | Explicitly described in the UI as a default that users may override | Move out of system settings and merge with the existing user field. |

There should not be a system-wide, editable `defaults` category for these. The
existing profiles become groups, and a group's defaults initialize a new user's
stored preferences. They are not consulted as fallbacks on each request.

## Maintenance settings outside `/settings`

| Current name | Proposed name | Owner | Recommendation |
| --- | --- | --- | --- |
| `maintenance_time` | `scheduledTime` | System: `maintenance` | Keep if scheduled maintenance remains. |
| `enabled_tasks` | `enabledTasks` | System: `maintenance` | Keep; validate against known task IDs. |
| `backup_time` | none | System | It is read but not written by the current Maintenance form. Remove it with `s3_backup_time`; `maintenance_time` is authoritative. |

The current task IDs are `data_backup`, `logs_cleanup`, and `health_checks`.
Maintenance history and “run now” are operational resources/actions, not
settings.

## User preferences and group defaults

Rename the current **profile** concept to **group**. A group contains a name,
description, permissions/features, default preferences, and keywords. When a
user is created, the group preference defaults are copied to that user. The
user thereafter owns complete preference values rather than sparse overrides.

### Display

| Current name/storage | Proposed name | Current owner | Target owner | Recommendation |
| --- | --- | --- | --- | --- |
| `cached_time_format` / `timeFormat` | `timeFormat` | Browser cache and root React state | User: `display`; initialized from group on creation | Keep; values are `12h` or `24h`. |
| Browser/API timezone settings | none | Removed | UTC application behavior | Do not reintroduce. |

### Inbox

| Current name/storage | Proposed name | Current owner | Target owner | Recommendation |
| --- | --- | --- | --- | --- |
| `recordsPerPage` | `recordsPerPage` | Per-user pagination endpoint | User: `inbox`; initialized from group on creation | Keep. Use `0` for continuous scrolling. |
| `currentPage` | none | Per-user pagination endpoint | Transient page state | Do not persist; opening an inbox should not restore a stale page number. |
| `reverseSort` | `sortDirection` | Per-user pagination endpoint and root state | User: `inbox`; initialized from group on creation | Prefer an explicit value such as `newestFirst`/`oldestFirst` over a reverse boolean. |
| `showFullTimestamps` | `showFullTimestamps` | Per-user pagination endpoint | User: `inbox`; initialized from group on creation | Keep if the control remains. |
| `global_inbox_view_mode` | none | System setting | Removed | Represent continuous scrolling with `recordsPerPage: 0`. |
| `global_inbox_records_per_page` | `recordsPerPage` | System default | Group creation default copied to user | Merge with the existing per-user field. |
| `showTime` | `showTime` | Browser local storage | User: `inbox`; initialized from group on creation | Move. |
| `showCar` | `showCar` | Browser local storage | User: `inbox`; initialized from group on creation | Move. |
| `showChannel` | `showChannel` | Browser local storage | User: `inbox`; initialized from group on creation | Move. |
| `showPerson` | `showPerson` | Browser local storage | User: `inbox`; initialized from group on creation | Move. |
| `timeFilter` | `timeRangePreset` | Browser local storage | Browser/application state | Keep in the browser; clearing browser data resets it. |
| custom start/end dates and times | no rename | Browser local storage | Browser/application state | Keep with the time-range selection; clearing browser data resets it. |
| `activeChannels` | `channelFilter` | Browser local storage | Browser state | Keep in the browser. |
| `global_live_mode_enabled` | `liveModeEnabled` | System setting | Browser state | Move to the browser. |

### Reports

| Current name/storage | Proposed name | Current owner | Target owner | Recommendation |
| --- | --- | --- | --- | --- |
| `reports_density_mode` | `density` | Browser local storage | User: `reports`; initialized from group on creation | Keep if the density control remains. |

### User preference example

```json
{
  "display": {
    "timeFormat": "24h"
  },
  "inbox": {
    "recordsPerPage": 20,
    "sortDirection": "newestFirst",
    "showFullTimestamps": false,
    "showTime": true,
    "showCar": false,
    "showChannel": true,
    "showPerson": false
  },
  "reports": {
    "density": "comfortable"
  }
}
```

This is a complete stored user preference object. Group values initialize it at
user creation; there is no runtime group/application fallback chain.

## Browser storage inventory

Approved durable browser/application state includes `isDarkMode`, the active
channel filter, the inbox time-range selection, and live mode. Authentication
storage is tracked here but is not itself a setting.

| Current key | Classification | Target |
| --- | --- | --- |
| `isDarkMode` | Browser preference needed before React renders | Keep. |
| `token`, `user`, `name` | Authentication/session data | Keep the current bearer-token approach for now; authentication redesign is outside this inventory. A bearer credential need not be a JWT. |
| `cached_channels`, `cached_messages`, `cached_keywords`, `last_fetch_time` | Application data cache | Remove from local storage during the inbox/data redesign. A query cache need not be persisted. |
| `cached_time_format` | User preference cache | Move to current user/group preference resolution. |
| `showTime`, `showCar`, `showChannel`, `showPerson` | User inbox preferences | Move to the user. |
| `timeFilter`, custom date/time keys | Inbox view state | Keep as browser/application state; clearing browser data resets it. |
| `activeChannels` | Inbox filter state | Keep in the browser. |
| `global_live_mode_enabled` / future `liveModeEnabled` | Live inbox state | Remove the global API field and keep the replacement in the browser. |
| `reports_density_mode` | User report preference | Move to the user. |
| `ledStatusIndicatorsEnabled` | Interface preference for a feature being removed | Remove. |
| `hideHallucination` | UI state/cache behavior | Remove or replace with ordinary component state; it is not an authoritative setting. |
| `chatbotPosition`, `docIconPosition` | Browser UI placement | Remove under the browser-storage rule, or treat as non-settings ephemeral state. |
| `LOG_LEVEL` | Developer diagnostic override | Replace the local-storage override with a build/runtime environment variable. |
| remembered-login username/flag | Login convenience data | Separate privacy/product decision; it is not part of Settings. |
| `audioIsPlaying` | Cross-component runtime signal | Replace with React/audio playback state; do not persist. |
| `mfa_reminder_dismissed` in session storage | Session-only dismissal | Keep as transient session UI state if still required. |

## Settings-page components by responsibility

### Actual settings editors

| Current component | Target responsibility |
| --- | --- |
| `GlobalSettings` | Split among transcription, user/group defaults, recorder switches, and Wi-Fi. The generic name should disappear. |
| `HallucinationsSection` | Admin visibility preferences with matching `show…` semantics, plus the `audioProcessing` pattern collection. |
| `BackupRestore` | Split persisted backup settings from backup/restore operations. |
| `Maintenance` | Split scheduled maintenance settings from history and run-now operations. |
| `ProfileManagement` | Rename to group management and add group default preferences. |
| `ApiKeyManagement` | API-key domain; separate from ordinary settings and keep admin authorization. |

### Domain resources or operations, not settings objects

| Components | Domain |
| --- | --- |
| `ChannelSettings`, `ChannelCreateModal`, `ChannelEditModal` | Channels |
| `FrequencyManagement`, `tone-codes` | Stations/frequencies |
| `RecorderDevices`, `USBRecorders` | Recorder inventory/configuration/firmware |
| `Health` | Health telemetry and purge operation |
| `TranscriptionEngine` | Queue status, logs, requeue/kill/purge operations; only its configuration form is settings-related |
| `BackupProgressModal`, `RestoreModal` | Backup/restore job workflow |
| `DangerZone` | Destructive actions |
| `ReportsManagement` | Reports domain and should not live under Settings |
| `ScannerTabel` | Scanner operations; currently unreachable from Settings navigation |

### Layout/navigation helpers

`SettingsPage`, `SettingsSearchBar`, `SettingsSectionHeader`,
`SettingsSectionLayout`, `SettingsSubnav`, and the section wrapper components
are UI composition rather than persisted settings.

### Unreferenced candidates

Remove `AudioUploader`, `CacheManagement`, `ColorPalettePicker`,
`EventManagement`, `FrequencyForm`, `StreamsSection`, and `ThemeSelector` after
a final reference/build check.

`DeviceSettingsModal` is also unreferenced. Its required functionality should be
merged into the admin-only `Dashboard/ChannelSettingsModal`, after which the
separate device modal should be removed. The sidebar channel Info button must be
shown only to administrators.

The two modals address different resources:

- `Dashboard/ChannelSettingsModal` edits the server-side channel record selected
  in the inbox sidebar. It reads `/channel/{id}` and edits recording threshold,
  silence/minimum/maximum recording durations, gain, small-file discard, and
  pre-record values. `Dashboard/Sidebar` saves those values with
  `PUT /channel/{id}`.
- `Settings/DeviceSettingsModal` is a much larger physical-recorder management
  UI. It accepts a serial `devicePort`, device status, serial data, and monitor
  messages; sends recorder CLI `export`/`import` commands through
  `/recorders/monitor/send`; and edits recorder audio, Wi-Fi/API destinations,
  logging flags, SD-card, RTC, and other firmware settings.

They overlap on audio recording fields, but one edits a backend channel model
and the other commands recorder firmware over the monitor connection. The
merged modal has these requirements:

1. Reuse the Recorder page's device inventory and serial-monitor data. Determine
   whether the channel's physical recorder is currently connected by USB by
   matching the channel and device MAC addresses case-insensitively.
2. When a matching USB recorder is connected, treat its `export` response as the
   authoritative source for **all** channel/device settings shown in the modal,
   not merely as a temporary source for missing fields. Do not initialize those
   controls from a potentially stale channel record.
3. On save for a USB-connected recorder, merge the edits into the exported
   configuration, import the complete result, save it to the recorder, and then
   update the channel record as a synchronized server-side copy. When no matching
   USB recorder is connected, the channel record remains the authoritative
   source and save target. The current best-effort `SET …`/`SAVE` call by MAC is
   only a partial version of this import/export workflow.
4. Report channel-record and device import/save results separately. A save must
   not be reported as a complete success if USB synchronization failed.
5. Add hostname, IP address, and device-dashboard connection information to the
   channel response and display it in the modal. For a connected USB recorder,
   the export response remains authoritative and the channel fields are its
   synchronized server-side copy.
6. Render a link to the device-hosted dashboard when a usable hostname or IP is
   available. The URL must be constructed from validated device data, open in a
   new tab with `noopener,noreferrer`, and clearly indicate when the device is
   unreachable or no address has been reported.
7. Incorporate the still-required recorder audio, Wi-Fi/API destination,
   logging, SD-card, RTC, and firmware controls from `DeviceSettingsModal` into
   organized sections of the merged modal.

## Decisions captured by this inventory

Resolved decisions:

1. Duplicate and hallucination visibility are admin-only user preferences with
   consistent positive semantics: `showDuplicateRecordings` and
   `showHallucinations`.
2. Live mode is browser state.
3. Channel filters and time range remain browser/application state.
4. Scanners and recorders remain supported.
5. `global_transcribe_node` is removed.
6. `s3_backup_time` and `backup_time` are removed; `maintenance_time` owns the
   schedule.
7. Group preference values initialize users; users then own their preferences.
8. All remaining system settings are admin-only. Non-admin users may update
   only their own user preferences and browser state.
9. Advanced patterns accept any valid expression supported by the agreed
   JavaScript runtime. Case sensitivity is explicit; callers do not supply raw
   flags. Validation and resource limits protect the matching path.
10. Keywords remain stored on the group. Relevant group data is returned with
    the current user rather than copying keywords to the user.
11. The Recorder page continues to manage USB-connected devices. USB association
    is determined by matching MAC addresses. While a matching USB device is
    connected, its `export` response is authoritative for all channel/device
    settings; the channel record is updated as a synchronized copy. Without a
    matching USB connection, the channel record is authoritative. Hostname, IP
    address, and dashboard connection fields are added to channel data and follow
    the same synchronization rule.
