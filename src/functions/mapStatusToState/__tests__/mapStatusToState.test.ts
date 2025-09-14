import { mapStatusToState } from '../mapStatusToState';

describe('mapStatusToState function', () => {
  it('returns correct state for status "error"', () => {
    const error = new Error('Something went wrong');

    const state = mapStatusToState('error', error);

    expect(state).toEqual({
      error,
      isError: true,
      isPending: false,
      isSuccess: false,
    });

    expect(state.error).toBeInstanceOf(Error);
    expect(state.isError).toBe(true);
  });

  it('returns correct state for status "pending"', () => {
    const state = mapStatusToState('pending');

    expect(state).toEqual({
      error: null,
      isError: false,
      isPending: true,
      isSuccess: false,
    });

    expect(state.error).toBeNull();
    expect(state.isPending).toBe(true);
  });

  it('returns correct state for status "success"', () => {
    const state = mapStatusToState('success');

    expect(state).toEqual({
      error: null,
      isError: false,
      isPending: false,
      isSuccess: true,
    });

    expect(state.error).toBeNull();
    expect(state.isSuccess).toBe(true);
  });

  it('returns correct state for status "initial"', () => {
    const state = mapStatusToState('initial');

    expect(state).toEqual({
      error: null,
      isError: false,
      isPending: false,
      isSuccess: false,
    });
  });

  it('ensures error is ignored for non-error status', () => {
    const fakeError = new Error('Should be ignored');
    const state = mapStatusToState('success', fakeError as any);

    expect(state.error).toBeNull();
    expect(state.isSuccess).toBe(true);
  });
});
