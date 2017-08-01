import React, {Component} from 'react';
import {Button} from 'react-toolbox/lib/button';
import {Tab, Tabs} from 'react-toolbox/lib/tabs';

import IndeterminateProgressLine, {doWithProgressLine} from './IndeterminateProgressLine';
import Stream from '../containers/Stream';

import {onBottomReaching} from '../lib/scroll';

import styles from '../../assets/styles/feed.css';
import {results as resultsClassName} from '../../assets/styles/search.css';

import tags from '../../assets/tags.json';
const primaryTags = Object.keys(tags);

export default class Feed extends Component {

  handleTabChange = activeSubFeed => this.setState({filters: this.props.initialFilters, activeSubFeed});

  incrementOffsetFilter = (n = this.state.filters.limit) => this.setState({filters:{...this.state.filters, offset: this.state.filters.offset + n}});
  setSearchingVisibility = searching => this.setState({searching});
  loadMoreStreams = action => (token = this.props.token) =>
    doWithProgressLine(() => this.props.fetchAndReceiveStreams(action)(this.state.filters, token), this.setSearchingVisibility)
      .then(this.incrementOffsetFilter);

  loadMoreLatestStreams = this.loadMoreStreams(this.props.fetchAndReceiveLatestStreamsAction);
  loadMorePopularStreams = this.loadMoreStreams(this.props.fetchAndReceivePopularStreamsAction);
  loadMoreLongestStreams = this.loadMoreStreams(this.props.fetchAndReceiveLongestStreamsAction);

  loadSubFeedStreams = subFeedIndex => token => [this.loadMorePopularStreams, this.loadMoreLatestStreams, this.loadMoreLongestStreams][subFeedIndex](token);

  onSearchTermChange = (filters, token) => Promise.resolve(this.setState({filters})).then(_ => this.loadSubFeedStreams(this.state.activeSubFeed)(token));

  dispatchScrollListener = (() => {
    const element = document.getElementsByClassName(resultsClassName)[0] || window;
    const handleScroll = () => onBottomReaching(() => this.loadSubFeedStreams(this.state.activeSubFeed)(this.props.token), element);

    return actionName => element[actionName]('scroll', handleScroll);
  })();

  maybeReloadOnPropsChange = (nextProps, props = this.props) =>
    ((nextProps.initialFilters.term !== props.initialFilters.term) || (nextProps.token !== props.token)) ?
      this.onSearchTermChange(nextProps.initialFilters, nextProps.token) : false;

  addTag = tag => this.setState({tags: this.state.tags.concat(tag)});
  removeTag = tag => this.setState({tags: this.state.tags.filter(tg => tg !== tag)});
  isInTags = tag => this.state.tags.includes(tag);
  getTagOnClick = tag => () => (this.isInTags(tag) ? this.removeTag : this.addTag)(tag);


  state = {
    filters: this.props.initialFilters,
    fetchedAll: false,
    activeSubFeed: 0,
    searching: false,
    tags: [],
  }

  componentWillMount = () => this.loadSubFeedStreams(this.state.activeSubFeed)(this.props.token);

  componentDidMount = () => this.dispatchScrollListener('addEventListener');
  componentWillUnmount = () => this.dispatchScrollListener('removeEventListener');

  componentWillReceiveProps = nextProps => this.maybeReloadOnPropsChange(nextProps, this.props)

  render(){
    return (
      <div>
        <Tabs theme={styles} index={this.state.activeSubFeed} onChange={this.handleTabChange}>
          <Tab label='Most Popular' onActive={this.loadMorePopularStreams}>
            <div className={styles.streams}>
              {this.props.popular.map(s => <Stream id={s} key={s} />)}
            </div>
          </Tab>
          <Tab label='Latest' onActive={this.loadMoreLatestStreams}>
            {this.props.initialFilters.term === undefined && <div className={styles.tags}>
              {primaryTags.map(ptag =>
                <span key={ptag} className={this.isInTags(ptag) ? styles.selectedTag : styles.tag} onClick={this.getTagOnClick(ptag)}>{ptag}</span>
              )}
            </div>}
            <div className={styles.streams}>
              {this.props.latest.map(s => <Stream id={s} key={s} />)}
            </div>
          </Tab>
          <Tab label='Longest' onActive={this.loadMoreLongestStreams}>
            <div className={styles.streams}>
              {this.props.longest.map(s => <Stream id={s} key={s} />)}
            </div>
          </Tab>
        </Tabs>

        <IndeterminateProgressLine visible={this.state.searching} />
      </div>
    );
  }
}
