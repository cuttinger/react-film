import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import FilmContext from './FilmContext';

const SCROLL_BAR_HEIGHT = 16;
const SCROLL_BAR_PADDING = 4;

const ROOT_CSS = css({
  bottom: 0,
  boxSizing: 'border-box',
  height: SCROLL_BAR_HEIGHT,
  padding: SCROLL_BAR_PADDING,
  position: 'absolute',
  width: '100%',

  '& > .handler': {
    backdropFilter: 'blur(4px)',
    background: 'rgba(255, 255, 255, .4)',
    borderRadius: SCROLL_BAR_HEIGHT / 2,
    height: SCROLL_BAR_HEIGHT - SCROLL_BAR_PADDING * 2
  }
});

export default ({ className }) =>
  <FilmContext.Consumer>
    { context =>
      <div className={ classNames(ROOT_CSS + '', className) }>
        <div
          className="handler"
          style={{
            marginLeft: context.scrollBarLeft,
            width: context.scrollBarWidth
          }}
        />
      </div>
    }
  </FilmContext.Consumer>