import { getRecordingTimestampFromFilename } from '../src/utils/inboxViewWindow';

describe('getRecordingTimestampFromFilename', () => {
  test.each([
    ['/recordings/channel_3/audio_20250707_120747.wav', '20250707_120747'],
    ['recordings\\channel_1\\2026-01-21-12-54-27.wav', '20260121_125427'],
    ['/audio_20250702_051214.wav?download=true', '20250702_051214'],
  ])('parses the recording date and time from %s', (filename, expected) => {
    expect(getRecordingTimestampFromFilename(filename)).toBe(expected);
  });

  test.each([
    null,
    '',
    '/recordings/audio.wav',
    '/recordings/audio_20250230_120000.wav',
    '/recordings/audio_20250101_246000.wav',
  ])('returns null for an absent or invalid filename (%s)', (filename) => {
    expect(getRecordingTimestampFromFilename(filename)).toBeNull();
  });
});
