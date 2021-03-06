import React, {Component} from 'react';

import {Button, Input, Autocomplete} from 'react-toolbox';
import {arrayMove} from 'react-sortable-hoc';

import UploadArtwork from './UploadArtwork';
import TagsAutocomplete from './TagsAutocomplete';
import QueueSong from '../containers/QueueSong';
import SortableItems from '../components/SortableItems';

import {uploadArtwork} from '../lib/ebApi/streams';
import {playlistDuration, duration} from '../lib/duration';
import {addSongsType} from '../lib/song';
import {primaryTags, getSecondaryTagsOf, getPrimaryTagsFrom} from '../lib/genres';

import styles from '../../assets/styles/streamPublication.css';


const getNewStreamData = artwork_url => ({
  title: '',
  description: '',
  artwork_url,
  tags: [],
});


export default class StreamEditing extends Component {

  setTitle = title => this.setState({title});
  setDescription = description => this.setState({description});


  uploadArtwork = file => uploadArtwork(file, this.props.token);
  setArtworkUrl = artwork_url => () => this.setState({artwork_url});
  setUploadedArtworkUrl = uploadedArtworkUrl => this.setState({uploadedArtworkUrl});
  rmUploadedArtworkUrl = () => this.setUploadedArtworkUrl('');


  getTags = (addedPrimaryTags = getPrimaryTagsFrom(this.state.tags)) =>
    addedPrimaryTags.length  ? getSecondaryTagsOf(addedPrimaryTags) : primaryTags;
  setTags = tags => this.setState({tags});

  handleTagsChange = tags => this.setState({tags});
  addTag = tag => () => this.setState({tags: [tag, ...this.state.tags]});
  removeTag = tag => () => this.setState({tags: this.state.tags.filter(t => t !== tag)});

  isAllFielsFilled = () => this.state.title && this.state.description && this.state.tags.length && this.state.artwork_url;
  save = () => this.props.save(this.state.title, this.state.description, this.state.tags, this.state.artwork_url, this.state.songs, this.props.token)
    .then(this.props.onCancel);
  maybeSave = () => this.isAllFielsFilled() ? this.save() : this.setState({triedSave: true});
  maybeError = (filled, errMssg) => (this.state.triedSave && !filled) ? errMssg : false;

  onSortEnd = ({oldIndex, newIndex}) => this.setState({songs: arrayMove(this.state.songs, oldIndex, newIndex)});

  maybeGetStreamData = () => this.props.stream ?
    {...this.props.playlist, tags: this.props.stream.all_tags, artwork_url: this.props.stream.artwork_url} :
    getNewStreamData(this.props.songs[0].artwork_url);


  state = {
    ...this.maybeGetStreamData(),

    uploadedArtworkUrl: '',
    songs: addSongsType(this.props.songs),

    triedSave: false,
  };

  componentWillReceiveProps = nextProps => this.setState({songs: addSongsType(nextProps.songs)});

  render() {
    return(
      <div className={styles.root}>
        <div className={styles.header}>
          <div className={styles.leftReg}>
            <div className={styles.title}>
              <span>Save Stream</span>
            </div>
          </div>
          <div className={styles.rightReg}>
            <div className={styles.buttons}>
              <Button theme={styles} icon='save' label='Save' raised onClick={this.maybeSave} />
              <Button theme={styles} label='Cancel' flat onClick={this.props.onCancel} />
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.leftReg}>
            <div className={styles.bodyLeftReg}>

              <div>
                <Input type='text' name='title' label='Room Name'
                  className={styles.pName} theme={styles} value={this.state.title}
                  onChange={this.setTitle} error={this.maybeError(this.state.title, 'Room title is required')} />
                <Input type='text' multiline name='description' label='Room Description'
                  className={styles.pDescription} theme={styles} maxLength={1000} value={this.state.description}
                  onChange={this.setDescription} error={this.maybeError(this.state.description, 'Room description is required')} />

                <div className={styles.actionTitle}>Choose Artwork:</div>
                <div className={styles.artworks}>
                  <UploadArtwork
                    uploadedArtworkUrl={this.state.uploadedArtworkUrl}
                    rmUploadedArtworkUrl={this.rmUploadedArtworkUrl}
                    selectedArtworkUrl={this.state.artwork_url}
                    setArtworkUrl={this.setArtworkUrl}
                    uploadArtwork={this.uploadArtwork}
                    setUploadedArtworkUrl={this.setUploadedArtworkUrl}
                    styles={styles} />
                  {this.props.songs.map(song =>
                    <a key={song.id}>
                      <img src={song.artwork_url} alt='artwork'
                        className={this.state.artwork_url == song.artwork_url ? styles.selected : ''}
                        onClick={this.setArtworkUrl(song.artwork_url)} />
                      {this.state.artwork_url == song.artwork_url && <i className={styles.selectedIcon}>check_circle</i>}
                    </a>
                  )}
                </div>
              </div>

              <div className={styles.actionTitle}>Choose Tags:</div>
              <div className={styles.tagsArea}>
                <TagsAutocomplete
                  allTags={this.getTags()}
                  addedTags={this.state.tags}
                  setTags={this.setTags}
                  theme={styles}
                  errorHandler={this.maybeError(this.state.tags.length, 'Tags are required')}
                />
              </div>


            </div>
          </div>

          <div className={styles.bodyRightReg}>
            <div className={styles.tracklistInfo}>
              <b>Tracklist:</b> <span>{this.props.songs.length} songs, {duration(playlistDuration(this.props.songs))}</span>
            </div>

            <div>
              <SortableItems playlist={this.props.playlist} items={this.state.songs} onSortEnd={this.onSortEnd} useDragHandle />
            </div>
          </div>

        </div>
      </div>
    )
  }
}
