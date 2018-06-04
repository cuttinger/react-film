import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

import ScrollSpy from './ScrollSpy';
import ScrollTo from './ScrollTo';

const ROOT_CSS = css({
  overflow: 'hidden',
  position: 'relative',

  '& > .strip': {
    height: '100%',
    overflowX: 'scroll',
    overflowY: 'hidden',
    MsOverflowStyle: 'none',
    touchAction: 'pan-x',
    WebkitOverflowScrolling: 'touch',

    '&::-webkit-scrollbar': {
      display: 'none'
    },

    '& > ul': {
      display: 'flex',
      listStyleType: 'none',
      margin: 0,
      padding: 0,

      '& > li': {
        display: 'flex'
      }
    }
  }
});

function best(array, scorer) {
  return array.reduce((best, item, index) => {
    const score = scorer.call(array, item, index);

    if (score > best.score) {
      return { index, score };
    } else {
      return best;
    }
  }, { index: -1, score: -Infinity }).index;
}

export default class Film extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleScroll = this.handleScroll.bind(this);
    this.handleScrollToEnd = this.handleScrollToEnd.bind(this);
    this.saveStripRef = this.saveStripRef.bind(this);

    this.state = {
      index: -1,
      stripRef: null,
      viewLeft: 0,
      viewWidth: 0
    };
  }

  componentDidUpdate(prevProps) {
    const { scrollTo } = this.props;

    if (scrollTo && scrollTo !== prevProps.scrollTo) {
      const view = this.getView();

      if (view) {
        const { indexFraction } = view;

        this.setState(() => ({
          scrollLeft: this.getScrollLeft(scrollTo({ indexFraction }))
        }));
      }
    }
  }

  getView() {
    const target = ReactDOM.findDOMNode(this.state.stripRef);

    if (target) {
      const scrollLeft = this.state.scrollLeft || target.scrollLeft;
      const items = target.querySelectorAll('ul > li');
      const scrollCenter = scrollLeft + target.offsetWidth / 2;
      const index = best([].slice.call(items), item => {
        const offsetCenter = item.offsetLeft + item.offsetWidth / 2;

        return 1 / Math.abs(scrollCenter - offsetCenter);
      });

      if (~index) {
        const item = items[index];
        const offsetCenter = item.offsetLeft + item.offsetWidth / 2;
        let indexFraction = index + (scrollCenter - offsetCenter) / item.offsetWidth;

        if (indexFraction % 1 > .99 || indexFraction % 1 < .01) {
          indexFraction = Math.round(indexFraction);
        }

        let selectedIndex;

        if (scrollCenter <= target.offsetWidth / 2) {
          selectedIndex = 0;
        } else if (scrollCenter >= target.scrollWidth - target.offsetWidth / 2) {
          selectedIndex = items.length - 1;
        } else {
          selectedIndex = Math.round(indexFraction);
        }

        return {
          index: selectedIndex,
          indexFraction,
          items,
          target
        };
      }
    }
  }

  getScrollLeft(index) {
    const target = ReactDOM.findDOMNode(this.state.stripRef);

    if (target) {
      const items = target.querySelectorAll('ul > li');
      const item = items[Math.max(0, Math.min(items.length - 1, index))];

      if (item) {
        const itemOffsetCenter = item.offsetLeft + item.offsetWidth / 2;

        return itemOffsetCenter - target.offsetWidth / 2;
      }
    }
  }

  handleScroll(event) {
    if (this.props.onScroll) {
      const { index, indexFraction } = this.getView();

      this.props.onScroll({
        ...event,
        index,
        indexFraction
      });
    }
  }

  handleScrollToEnd() {
    this.setState(() => ({ scrollLeft: null }));

    this.props.onScrollToEnd && this.props.onScrollToEnd();
  }

  saveStripRef(ref) {
    this.setState(() => ({ stripRef: ref }));
  }

  render() {
    const { props, state } = this;

    return (
      <div className={ classNames(ROOT_CSS + '', props.className) }>
        <div
          className="strip"
          ref={ this.saveStripRef }
        >
          <ul>
            {
              React.Children.map(props.children, child => <li>{ child }</li>)
            }
          </ul>
        </div>
        {
          !!props.onScroll &&
            <ScrollSpy
              // onScroll={ props.onScroll }
              onScroll={ this.handleScroll }
              target={ state.stripRef }
            />
        }
        {
          typeof state.scrollLeft === 'number' &&
            <ScrollTo
              onEnd={ this.handleScrollToEnd }
              scrollLeft={ state.scrollLeft }
              target={ state.stripRef }
            />
        }
      </div>
    );
  }
}