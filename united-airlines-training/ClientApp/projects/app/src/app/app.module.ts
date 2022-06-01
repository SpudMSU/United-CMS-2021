import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './route';
import { AppComponent } from './app.component';
import { MediaPageComponent } from './media-page/media-page.component';
import { PageHeaderComponent } from './page-header/page-header.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { CategoryComponent } from './category/category.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { HelpComponent } from './help/help.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { PageFooterComponent } from './page-footer/page-footer.component';
import { HttpClientModule } from '@angular/common/http';
import { MediaService } from './services/media.service';
import { FeedbackService } from './services/feedback.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy, CommonModule } from '@angular/common'; // Solution to refresh 404 error. Please note # in url now.
import { NgxPaginationModule } from 'ngx-pagination';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MediaPopUpComponent } from './media-pop-up/media-pop-up.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from './services/user.service';
import { RatingService } from './services/rating.service';
import { DatabaseService } from './services/database.service';
import { SearchResultsComponent } from './search-results/search-results.component';
import { FeedbackModalComponent } from './feedback-modal/feedback-modal.component';
import { EditchannelComponent } from './Editchannel/Editchannel.component';
import { AddchannelComponent } from './Addchannel/Addchannel.component';
import { UploadPageComponent } from './upload-page/upload-page.component';
import { CcPopUpComponent } from './cc-pop-up/cc-pop-up.component';
import { EditchildtitlePopUpComponent } from './editchildtitle-pop-up/editchildtitle-pop-up.component';
import { AnalyticsPageComponent } from './analytics-page/analytics-page.component';
import { AnalyticReportPageComponent } from './analytic-report-page/analytic-report-page.component';
import { UserAdminPageComponent } from './user-admin-page/user-admin-page.component';
import { MediaAdminPageComponent } from './media-admin-page/media-admin-page.component';
import { UserSaveModalComponent } from './user-save-modal/user-save-modal.component';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';
import { PipeComponent } from './pipe/pipe.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { CommentQueuePageComponent } from './comment-queue-page/comment-queue-page.component';
import { ContactModalComponent } from './contact-modal/contact-modal.component';
import { MediaAuditLogComponent } from './media-audit-log/media-audit-log.component';
import { AdminAuditLogComponent } from './admin-audit-log/admin-audit-log.component';
import { CommentAuditLogComponent } from './comment-audit-log/comment-audit-log.component';
import { DataImportExportComponent } from './data-import-export/data-import-export.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { ChannelSubviewComponent } from './upload-page/channel-subview/channel-subview.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatListModule } from '@angular/material/list';
import { CommentsViewComponent } from './media-page/comments-view/comments-view.component';
import { CommentComponent } from './media-page/comments-view/comment/comment.component';
import { ChangeComponent } from './change/change.component';
import { RejectCommentModalComponent } from './reject-comment-modal/reject-comment-modal.component';
import { ManageCommentsComponent } from './manage-comments/manage-comments.component';
import { MatSortModule } from '@angular/material/sort';
import { DistanceLearningContentComponent } from './media-page/distance-learning-content/distance-learning-content.component';
import { DistanceLearningSessionViewComponent } from './distance-learning-session-view/distance-learning-session-view.component';
import { EditSessionModalComponent } from './distance-learning-session-view/edit-session-modal/edit-session-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CategoryComponent,
    FeedbackComponent,
    HelpComponent,
    AboutusComponent,
    PageHeaderComponent,
    NavbarComponent,
    PageFooterComponent,
    MediaPageComponent,
    MediaPopUpComponent,
    SearchResultsComponent,
    FeedbackModalComponent,
    EditchannelComponent,
    AddchannelComponent,
    UploadPageComponent,
    CcPopUpComponent,
    EditchildtitlePopUpComponent,
    AnalyticsPageComponent,
    AnalyticReportPageComponent,
    UserAdminPageComponent,
    MediaAdminPageComponent,
    UserSaveModalComponent,
    PipeComponent,
    UnauthorizedComponent,
    CommentQueuePageComponent,
    ContactModalComponent,
    MediaAuditLogComponent,
    AdminAuditLogComponent,
    CommentAuditLogComponent,
    DataImportExportComponent,
    ChannelSubviewComponent,
    ProfilePageComponent,
    CommentsViewComponent,
    CommentComponent,
    ChangeComponent,
    RejectCommentModalComponent,
    ManageCommentsComponent,
    DistanceLearningContentComponent,
    DistanceLearningSessionViewComponent,
    EditSessionModalComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    NgxPaginationModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatGridListModule,
    AutocompleteLibModule,
    MatAutocompleteModule,
    MatListModule,
    MatSortModule
  ],
  providers: [
    MediaService,
    FeedbackService,
    UserService,
    RatingService,
    DatabaseService,
    UnsavedChangesGuard,
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
