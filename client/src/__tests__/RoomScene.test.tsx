import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { RoomScene } from '../components/RoomScene';

// rAF not available in jsdom — stub it
vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
  cb(0);
  return 0;
});
vi.stubGlobal('cancelAnimationFrame', () => {});

describe('RoomScene', () => {
  it('renders the SVG without crashing', () => {
    const { container } = render(<RoomScene lampOn={false} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders in lampOn=true state without crashing', () => {
    const { container } = render(<RoomScene lampOn={true} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
