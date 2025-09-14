import { handleScrollEnd } from '../handleScrollEnd';
import { HandleScrollEndOptions } from '../types';

describe('handleScrollEnd function', () => {
  it('should detect scroll end to the right', () => {
    const options: HandleScrollEndOptions = {
      sides: {
        bottom: false,
        left: false,
        right: true,
        top: false,
      },
      threshold: {
        bottom: 0,
        left: 0,
        right: 20,
        top: 0,
      },
      values: {
        maxAllowedScrollLeft: 500,
        maxAllowedScrollTop: 1000,
        prevScrollLeft: 450,
        prevScrollTop: 0,
        scrollLeft: 480,
        scrollTop: 0,
      },
    };

    expect(handleScrollEnd(options)).toEqual({
      bottom: false,
      left: false,
      right: true,
      top: false,
    });
  });

  it('should detect scroll end to the bottom', () => {
    const options: HandleScrollEndOptions = {
      sides: {
        bottom: true,
        left: false,
        right: false,
        top: false,
      },
      threshold: {
        bottom: 30,
        left: 0,
        right: 0,
        top: 0,
      },
      values: {
        maxAllowedScrollLeft: 1000,
        maxAllowedScrollTop: 1000,
        prevScrollLeft: 0,
        prevScrollTop: 950,
        scrollLeft: 0,
        scrollTop: 970,
      },
    };

    expect(handleScrollEnd(options)).toEqual({
      bottom: true,
      left: false,
      right: false,
      top: false,
    });
  });

  it('should detect scroll end to the left', () => {
    const options: HandleScrollEndOptions = {
      sides: {
        bottom: false,
        left: true,
        right: false,
        top: false,
      },
      threshold: {
        bottom: 0,
        left: 10,
        right: 0,
        top: 0,
      },
      values: {
        maxAllowedScrollLeft: 1000,
        maxAllowedScrollTop: 1000,
        prevScrollLeft: 25,
        prevScrollTop: 0,
        scrollLeft: 5,
        scrollTop: 0,
      },
    };

    expect(handleScrollEnd(options)).toEqual({
      bottom: false,
      left: true,
      right: false,
      top: false,
    });
  });

  it('should detect scroll end to the top', () => {
    const options: HandleScrollEndOptions = {
      sides: {
        bottom: false,
        left: false,
        right: false,
        top: true,
      },
      threshold: {
        bottom: 0,
        left: 0,
        right: 0,
        top: 15,
      },
      values: {
        maxAllowedScrollLeft: 1000,
        maxAllowedScrollTop: 1000,
        prevScrollLeft: 0,
        prevScrollTop: 30,
        scrollLeft: 0,
        scrollTop: 10,
      },
    };

    expect(handleScrollEnd(options)).toEqual({
      bottom: false,
      left: false,
      right: false,
      top: true,
    });
  });

  it('should detect nothing when no movement occurred', () => {
    const options: HandleScrollEndOptions = {
      sides: {
        bottom: true,
        left: true,
        right: true,
        top: true,
      },
      threshold: {
        bottom: 10,
        left: 10,
        right: 10,
        top: 10,
      },
      values: {
        maxAllowedScrollLeft: 200,
        maxAllowedScrollTop: 200,
        prevScrollLeft: 100,
        prevScrollTop: 100,
        scrollLeft: 100,
        scrollTop: 100,
      },
    };

    expect(handleScrollEnd(options)).toEqual({
      bottom: false,
      left: false,
      right: false,
      top: false,
    });
  });
});
