import { fireEvent, render, screen } from '@testing-library/react';
import GlobalSettings from './GlobalSettings';

const transcriptionSettings = {
  global_transcribe_method: 'local',
  global_model: 'base.en',
};

test('selects local transcription as an exclusive service', () => {
  const handleGlobalChange = jest.fn();

  render(
    <GlobalSettings
      activeSection="transcription-services"
      globalSettings={transcriptionSettings}
      handleGlobalChange={handleGlobalChange}
    />
  );

  fireEvent.click(screen.getByRole('radio', { name: /local transcription/i }));

  expect(handleGlobalChange).toHaveBeenCalledWith('global_transcribe_method', 'local');
});

test('waits for an API key before enabling Boondock API', () => {
  const handleGlobalChange = jest.fn();

  render(
    <GlobalSettings
      activeSection="transcription-services"
      globalSettings={transcriptionSettings}
      handleGlobalChange={handleGlobalChange}
    />
  );

  fireEvent.click(screen.getByRole('radio', { name: /boondock api/i }));
  expect(handleGlobalChange).not.toHaveBeenCalled();

  fireEvent.change(screen.getByLabelText(/transcription api key/i), { target: { value: 'secret-key' } });
  expect(handleGlobalChange).toHaveBeenCalledWith({
    global_transcription_api_key: 'secret-key',
    global_transcribe_method: 'openai',
  }, undefined, false);
});
