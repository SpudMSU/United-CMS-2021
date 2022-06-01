import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { Channel } from '../../models/channel';

@Component({
  selector: 'app-channel-subview',
  templateUrl: './channel-subview.component.html',
  styleUrls: ['./channel-subview.component.css']
})
export class ChannelSubviewComponent implements OnInit {
  @Input() channel: Channel
  @Input() level: number;
  @Input() submissionSubject: Subject<boolean>;
  @Input() selectedChannelsSubject: Subject<Channel[]>;
  @Input() selectedChannels: Channel[];

  @Output() channelAdded: EventEmitter<Channel> = new EventEmitter<Channel>();
  @Output() channelRemoved: EventEmitter<Channel> = new EventEmitter<Channel>();

  hasChildren: boolean;
  isSelected: boolean = false;
  childrenViewable: boolean = false;
  childArrow: HTMLElement;

  constructor() { }

  ngOnInit(): void {
    // This is a child channel, selectedChannels should have already been received
    if (this.level > 0) {
      this.isSelected = this.isChannelSelected(this.selectedChannels);
    }
    this.hasChildren = this.channel.child != null;
    this.submissionSubject.subscribe(event => {
      this.isSelected = event;
    })
    this.selectedChannelsSubject.subscribe(data => {
      this.isSelected = this.isChannelSelected(data);
      this.selectedChannels = data;
      this.childrenViewable = this.areChildrenSelected(this.channel.child, this.selectedChannels);
    })
  }

  isChannelSelected(selectedChannels: Channel[]): boolean {
    if (selectedChannels != null && selectedChannels.length != 0) {
      for (let channel of selectedChannels) {
        if (this.channel.channelID == channel.channelID) {
          return true
        }
      }
    }
    return false;
  }

  areChildrenSelected(children: Channel[], selected: Channel[]) {

    if (children == null || children.length == 0) {
      return false
    }

    for (let child of children) {
      let ind = selected.findIndex(ele => ele.channelID == child.channelID);
      if (ind != -1) {
        return true;
      }

      let areGrandChildrenSelected = this.areChildrenSelected(child.child, selected);
      if (areGrandChildrenSelected) {
        return true
      }
    }

    return false;
  }

  onChannelClick() {
    this.isSelected = !this.isSelected;
    if (this.isSelected) {
      this.channelAdded.emit(this.channel);
    } else {
      this.channelRemoved.emit(this.channel);
    }
  }

  onChildArrowClicked(event) {
    this.childrenViewable = !this.childrenViewable;
    if (this.childrenViewable) {
      event.target.innerHTML = 'keyboard_arrow_up';
    } else {
      event.target.innerHTML = 'keyboard_arrow_down';
    }
  }

  onChildChannelAdded(event) {
    this.channelAdded.emit(event);
  }

  onChildChannelRemoved(event) {
    this.channelRemoved.emit(event);
  }

}
