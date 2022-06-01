import { Component, OnInit } from '@angular/core';
import { ChannelService } from '../services/channel.service';
import { Channel } from '../models/channel';
import { Media } from '../models/media';
import { MediaType } from '../models/media-type';
import { MediaTypeService } from '../services/media-type.service';
import { MediaService } from '../services/media.service';
import { KeywordService } from '../services/keyword.service';
import { Keyword } from '../models/keyword';
import { environment } from '../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AdminAuditLog } from '../models/admin-audit-log';
import { AdminAuditLogService } from '../services/admin-audit-log.service';
import { User } from '../models/user';
import { ChangedChannel } from '../models/changed-channel';
import { ChangedChannelService } from '../services/changed-channel.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
  providers: [ChannelService]
})
export class CategoryComponent implements OnInit {

  rootchannel: Channel[]
  channel: Channel
  childChannels:  Channel[]
  channelMedias: Media[]
  mediaTypeNames: MediaType[] = []
  type: MediaType
  keylist: Keyword[]
  indexForType: number = 0
  perPageCount: number = 4
  SitePath: string = environment.SitePath
  currentchanneltitle: string = ''
  currentClasses: string = ''
  currentchannelid: number
  searchtype: string = 'title'
  roleCodeLevel: number = 0;
  currentlevel: number = 0
  isShown: boolean = true;
  searched: boolean = false;
  p: number = 1;
  level: number = 1;
  numperpage: string = 'five'

  searchInput = '';
  currentUser: User
    

  constructor(private _channelservice: ChannelService,
    private _mediatypeservice: MediaTypeService,
    private _keywordservice: KeywordService,
    private _mediaservice: MediaService,
    private _userService: UserService,
    private _adminAuditService: AdminAuditLogService,
    private _changedChannelService: ChangedChannelService,
    private router: ActivatedRoute,
    private router1: Router,) { }

  ngOnInit(): void {
    /*change the number of items per page*/
    this.numforeachpage()

    this.level = 1

    if (this.SitePath.slice(-1) == '/')
      this.SitePath = this.SitePath.slice(0, -1)

    this._userService.getCurrentUser().subscribe(user => {
      this.roleCodeLevel = user.roleCode
    })
    this._userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    this._channelservice.getRootChannels().subscribe(data => {
      this.rootchannel = data
      this.setChild(data, 0)
      this.searchchannelbyid()
    }, error => {
        console.log(error)
    })
  }

  /*dropdown for number of items per page*/
  numforeachpage() {
    if (this.numperpage === 'five') {
      this.perPageCount = 5
    }
    else if (this.numperpage === 'ten') {
      this.perPageCount = 10
    }
    else if (this.numperpage === 'twenty') {
      this.perPageCount = 20
    }
  }
  async logChanges(title: string, change: string, mediaID: number, channel: Channel) {
    let userName = this.currentUser.firstName.concat(" ").concat(this.currentUser.lastName)
    let roles = ["Guest", "Contributer", "Moderator", "Administrator"];
    let role = roles[this.currentUser.roleCode - 1];
    let currentdate = new Date()
    const entry: AdminAuditLog =
    {
      id: 0,
      category: "Channel",
      item: title,
      change: change,
      username: userName,
      userRole: role,
      changeDate: currentdate,
      mediaID: mediaID,
      reverted: false
    }
    await new Promise((resolve, reject) => {
      this._adminAuditService.createEntry(entry).subscribe(x => {
        const changed: ChangedChannel =
        {
          changeID: x.id,
          channelID: mediaID,
          title: channel.title,
          description: channel.description,
          icon: channel.icon
        }
        this._changedChannelService.postChangedChannel(changed).subscribe(x => {
          resolve()
        })
      });
    })
  }
  /*set child for rootchannel*/
  setChild(channels, id) {
    for (let channel of channels) {
      channel.child = []
      channel.level = id
      this._channelservice.getChannelChildren(channel.channelID).subscribe(childData => {
        for (let a of childData) {
          a.pID = channel.channelID
        }
        channel.child = childData
        if (id < 4) {
          this.setChild(childData, id)
        } else {
          for (let i of childData) {
            i.level = 4
          }
        }
      }, error => {
        console.log(error)
      })
    }
    id++
  }

  /*Get all media of the current channel*/
  searchchannelbyid() {
    this.router.params.subscribe(params => {
      var ID = params['channelId'];
      var Level = params['level']
      this.currentchannelid = ID
      this.currentlevel = Level
      this.currentchannelid && this.getChannelMedia(ID, this.rootchannel)

      this.p = 1
    })
  }

  /*Get channel name according to id*/
  getChanneltitlebyid(id: number, channels) {
    this.getTitleFromChannels(id, this.rootchannel)
  }

  /*Get channel name according to id*/
  getTitleFromChannels(id: number, channels) {
    for (const channel of channels) {
      var idstr = id + ''
      var chanelidstr = channel.channelID + ''
      if (chanelidstr === idstr) {
        this.currentchanneltitle = channel.title
        return false;
      } else {
        channel.child && this.getTitleFromChannels(id, channel.child)
      }
    }
  }

  /*Get channel media*/
  getChannelMedia(id: number, channels: Channel[]) {
    /*this.highlightcurrent(id, channels)*/
    this.findPnodeId(this.rootchannel, id)
    this.getChanneltitlebyid(id, this.rootchannel)
    
    this.mediaTypeNames = []
    if (id != -1) {
      this._channelservice.getChannelMedia(id).subscribe(data => {
        this.channelMedias = data;
        this.updateMediaType(data)

      })
    } 
  }

  /*update Media type*/
  updateMediaType(result: Media[]) {
    for (const item of result) {
      this._mediatypeservice.getMediaType(item.mediaTypeID).subscribe(typeData => {
        item.mediaTypeName = typeData.name
      })
    }
  }

  /*Update page number (work with pagination)*/
  updateIndex(p: number) {
    this.indexForType = this.perPageCount * (p - 1)
  }

  /*search by keyword or title*/
  onKey(value: string) {
    var type = this.searchtype
    if (type === 'keyword') {
      this.searchkeyword(value)
    }
    else {
      this.searchtitle(value)
    }
  }

  /*search base on media's keyword*/
  searchkeyword(value: string) {
    const inputarray = value.split(" ");
    const returnItems = []
    this.searched = true;
    for (const item of this.channelMedias) {
      this._keywordservice.getKeywordsOfMedia(item.mediaID).subscribe(data => {
        this.keylist = data
        for (let key of this.keylist) {
          if (inputarray.includes(key.word)) {
            returnItems.push(item)
          }
        }
      })
    }
    this.mediaTypeNames = []
    this.channelMedias = returnItems;
    this.updateMediaType(this.channelMedias)
  }

  /*search base on media's title*/
  searchtitle(value: string) {
    const current = []
    const returnItems = []
    this.searched = true;
    for (const item of this.channelMedias) {
      current.push(item)
    }
    this._channelservice.getChannelMedia(this.currentchannelid).subscribe(res => {
      var resArr = res;
      this._mediaservice.searchForMediaByTitle(value).subscribe(data => {
        this.channelMedias = data
        for (let c of this.channelMedias) {
          for (let r of resArr) {
            if (r.mediaID == c.mediaID) {
              returnItems.push(r)
            }
          }
        }
        this.mediaTypeNames = []
        this.channelMedias = returnItems;
        this.updateMediaType(this.channelMedias)
      })
    })
  }

  /*delete the rootchannel in the channel list*/
  async deletechannel(channelid) {
    if (confirm("Are you sure you want to delete?")) {
      await new Promise((resolve, reject) => {
        this._channelservice.getChannel(channelid).subscribe(res => {

          let change = "Deleted Channel"
          let mediaID = channelid
          let title = res.title
          this.logChanges(title, change, mediaID, res).then((res) => {
            resolve();
          })
        })
      })
      this._channelservice.deleteChannel(channelid).subscribe(res => {
        window.location.reload()
      })
    }
  }

  /*sort A to Z*/
  atoz() {
    let result = this.channelMedias;
    result && result.sort(
      function (a, b) {
        if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
        if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
        return 0;
      }
    );
    this.channelMedias = result;

  }

  /*sort Z to A*/
  ztoa() {
    let result = this.channelMedias;
    result && result.sort(
      function (a, b) {
        if (a.title.toLowerCase() > b.title.toLowerCase()) return -1;
        if (a.title.toLowerCase() < b.title.toLowerCase()) return 1;
        return 0;
      }
    );
    this.channelMedias = result;
  }

  /*click funtion for each channel in the left bar*/
  getspecificid(id: number, type: string, level: number) {
    this.channelMedias = []
    this.mediaTypeNames = []
    this.searched = false;
    if (this.currentchannelid == id) {
      this._channelservice.getChannelMedia(id).subscribe(data => {
        this.channelMedias = data
        this.updateMediaType(data)
      })
    }
    this.findPnodeId(this.rootchannel,id)
    this.router1.navigate(['/category', { channelId: id, level: level }]);
    this.searchInput = '';
  }

  /*Filter by channel type*/
  pick(mediatype: number) {
    var result = []
    this._channelservice.getChannelMedia(this.currentchannelid).subscribe(data => {
      for (const item of data) {
        if (item.mediaTypeID === mediatype) {
          result.push(item)
        }
      }
      this.updateMediaType(data)
    })
    this.indexForType = 0
    this.channelMedias = result   
  }

  /*Set parent node*/
  findPnodeId(data, nodeId) {
    // var result = this.familyTree(data,nodeId)
    var result = this.getParent(data, nodeId)
    var aa = this.setShow(result,data);
  }

  /*Set whether the channel is expanded*/
  setShow(currentTreeNode,tree){
    this.highlightcurrent(currentTreeNode,tree)
    return tree;
  }

  /*highlight the current channel*/
  highlightcurrent(id, channels) {
    for (const channel of channels) {
      var idstr = id
      var chanelidstr = channel.channelID
        if (idstr.includes(chanelidstr)) {
          channel.currentClasses = 'current'
          channel.show = true
        } else {
          channel.currentClasses = ''
          channel.show = false
        }
      channel.child && this.highlightcurrent(id, channel.child)
    }
  }

  /*Get all the corresponding parent nodes according to the child node id*/
  getParent(data2, nodeId2) {
    var arrRes = [];
    var aa = [];
    if (data2.length == 0) {
        if (!!nodeId2) {
            arrRes.unshift(data2)
        }
        return arrRes;
    }
    let rev = (data, nodeId) => {
        for (var i = 0, length = data.length; i < length; i++) {
            let node = data[i];
            if (node.channelID == nodeId) {
                arrRes.unshift(node)
                aa.unshift(node.channelID)
                rev(data2, node.pID);
                break;
            }
            else {
                if (!!node.child) {
                    rev(node.child, nodeId);
                }
            }
        }
        return arrRes;
    };
    arrRes = rev(data2, nodeId2);
    return aa;
  }

}
