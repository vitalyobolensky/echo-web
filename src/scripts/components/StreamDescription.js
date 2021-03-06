import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {Button, Tooltip} from 'react-toolbox';

import LoginDialog from './LoginDialog';
import StreamEditing from './StreamEditing';
import ShareIconMenu from './ShareIconMenu';
import AddToQueueButton from '../containers/AddToQueueButton';

import moment from 'moment';

import {likeStream, unlikeStream} from '../actions/SubFeedsActions';
import {maybeGetDefaultArtwork} from '../lib/stream';

import styles from '../../assets/styles/streamDescription.css';


const TooltipButton = Tooltip(Button);


const getLikeButtonOnClick = (token, dispatchLikeAction, stream, showLogin) => token ?
  dispatchLikeAction(stream.your_likes ? unlikeStream : likeStream)(stream, token) : showLogin;
const getLikeButtonTitle = liked => liked ? 'Liked' : 'Like';


const StreamDescriptionRender = props => (
  <div className={styles.root}>
    <div className={styles.header}>
      <span><b>Updated</b> {moment(props.stream.updated_at).fromNow()} by </span>
      <Link to={`/profile/${props.user.id}`}>
        <img src={props.user.avatar_url} alt='user avatar' className={styles.avatar} />
        <span>{props.user.name}</span>
      </Link>
      {props.editable && <div className={styles.editArea}>
        <span onClick={props.toggleStreamEditing}>edit</span>
        {props.streamEditing && <StreamEditing onCancel={props.toggleStreamEditing} save={props.update(props.stream.id)}
          stream={props.stream} playlist={props.playlist} songs={props.songs}
          token={props.token} />}
      </div>}
    </div>

    <div className={styles.body}>
      <div className={styles.artwork}>
        <img src={maybeGetDefaultArtwork(props.stream.artwork_url)} alt='artwork' className={styles.artworkImg} />

        <span className={styles.playPause}>
          {props.isPlaying ?
            <i onClick={props.pause} className={styles.playIcon}>pause</i>
            :
            <i onClick={props.inQueue ? props.play : props.addToQueueTopAndPlay(props.stream, props.playlist, props.songs)}
              className={styles.playIcon}>play_arrow</i>
          }
        </span>
      </div>

      <div className={styles.info}>
        <Link to={`/feed/${props.stream.id}`}>
          <div className={styles.title}>{props.playlist.title || 'no title'}</div>
        </Link>

        <div className={styles.time}>
          <span className={styles.length}>
            <i className={styles.lengthIcon}>queue_music</i> {props.playlist.songs.length}
          </span>
          <span className={styles.duration}>
            <i className={styles.durationIcon}>access_time</i> {props.duration}
          </span>
          <span className={styles.commentsCount}>
            <i className={styles.commentsIcon}>comment</i> {props.stream.comments_count}
          </span>
        </div>

        {props.playlist.description && <div className={styles.description}>
          <b>Room description:</b> <br />
          <i>
            <span>"{props.playlist.description}"</span>
          </i>
        </div>}
      </div>
    </div>

    {!!props.stream.all_tags.length && <div className={styles.tags}>
      <span>
        <span className={styles.t}>Tags:</span>
        {props.stream.all_tags.map(tag => (<span onClick={props.searchTag(tag)} key={tag} className={styles.tag}>#{tag}</span>))}
      </span>
    </div>}

    <div className={styles.footer}>
      <div className={styles.leftReg}>
        {!!props.stream.likes_count && <div className={styles.flex}>
          <i className={styles.likedIcon}>favorite</i><span>{props.stream.likes_count}</span>
        </div>}
      </div>
      <div className={styles.rightReg}>
        <AddToQueueButton type='stream' holder={props.stream} playlist={props.playlist} songs={props.songs} />
        <TooltipButton theme={styles} raised tooltip='Save to My Likes' tooltipDelay={500}
          onClick={getLikeButtonOnClick(props.token, props.dispatchLikeAction, props.stream, props.toggleLoginVisibility)}>
          <span className={styles.iconDescription}>
            <i className={styles.likeIcon}>favorite</i><span>{getLikeButtonTitle(props.stream.your_likes)}</span>
          </span>
        </TooltipButton>
        <ShareIconMenu path={`/feed/${props.stream.id}`} picture={props.stream.artwork_url}
          title={props.playlist.title} description={props.playlist.description} />
      </div>
    </div>

    {!props.token && <LoginDialog active={props.loginVisibility} onEscKeyDown={props.toggleLoginVisibility} />}
  </div>
)


class StreamDescription extends Component {

  toggleLoginVisibility = () => this.setState({loginVisibility: !this.state.loginVisibility});
  toggleStreamEditing = () => this.setState({streamEditing: !this.state.streamEditing});


  state = {
    loginVisibility: false,
    streamEditing: false,
  }

  render(){
    return (
      <StreamDescriptionRender {...this.props}
        loginVisibility={this.state.loginVisibility} toggleLoginVisibility={this.toggleLoginVisibility}
        streamEditing={this.state.streamEditing} toggleStreamEditing={this.toggleStreamEditing}
        editable={this.props.stream.allowed_users_ids.includes(this.props.currentUserId)}
      />
    )
  }
}


export default StreamDescription;
