import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ResourceFilterBar } from '../components/ResourceFilterBar';

const theme = createTheme();

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('ResourceFilterBar', () => {
  it('renders all type tabs', () => {
    wrap(<ResourceFilterBar value="all" onChange={vi.fn()} />);
    expect(screen.getByText('All')).toBeTruthy();
    expect(screen.getByText('Video')).toBeTruthy();
    expect(screen.getByText('Tab')).toBeTruthy();
    expect(screen.getByText('Article')).toBeTruthy();
    expect(screen.getByText('Exercise')).toBeTruthy();
    expect(screen.getByText('Tool')).toBeTruthy();
  });

  it('calls onChange with the selected type value', async () => {
    const onChange = vi.fn();
    wrap(<ResourceFilterBar value="all" onChange={onChange} />);
    await userEvent.click(screen.getByText('Video'));
    expect(onChange).toHaveBeenCalledWith('video');
  });

  it('calls onChange with "all" when All tab clicked', async () => {
    const onChange = vi.fn();
    wrap(<ResourceFilterBar value="video" onChange={onChange} />);
    await userEvent.click(screen.getByText('All'));
    expect(onChange).toHaveBeenCalledWith('all');
  });

  // Regression: before migration 018, DB had type='course' which has no tab.
  // Verify the tab list does NOT include 'Course' — that type is gone from the DB.
  it('does not have a Course tab (legacy DB type now remapped to video)', () => {
    wrap(<ResourceFilterBar value="all" onChange={vi.fn()} />);
    expect(screen.queryByText('Course')).toBeNull();
  });
});
