import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CategoryComponent } from './category/category.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { HelpComponent } from './help/help.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { MediaPageComponent } from './media-page/media-page.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { UploadPageComponent } from './upload-page/upload-page.component';
import { EditchannelComponent } from './Editchannel/Editchannel.component';
import { AddchannelComponent } from './Addchannel/Addchannel.component';
import { AnalyticsPageComponent } from './analytics-page/analytics-page.component';
import { AnalyticReportPageComponent } from './analytic-report-page/analytic-report-page.component';
import { UserAdminPageComponent } from './user-admin-page/user-admin-page.component';
import { MediaAdminPageComponent } from './media-admin-page/media-admin-page.component';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';
import { RoleGuard } from './guards/role.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { CommentQueuePageComponent } from './comment-queue-page/comment-queue-page.component';
import { AdminAuditLogComponent } from './admin-audit-log/admin-audit-log.component';
import { MediaAuditLogComponent } from './media-audit-log/media-audit-log.component';
import { CommentAuditLogComponent } from './comment-audit-log/comment-audit-log.component';
import { DataImportExportComponent } from './data-import-export/data-import-export.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { ChangeComponent } from './change/change.component';
import { ManageCommentsComponent } from './manage-comments/manage-comments.component';

const routes: Routes = [
  { path: '', redirectTo:'/home', pathMatch:'full' },
  { path: 'home', component: HomeComponent },
  { path: 'category', component: CategoryComponent },
  { path: 'category/:channelId/:level', component: CategoryComponent },
  { path: 'feedback', component: FeedbackComponent },
  { path: 'help', component: HelpComponent },
  { path: 'aboutus', component: AboutusComponent },
  { path: 'media/:mediaID', component: MediaPageComponent },
  { path: 'upload', component: UploadPageComponent, canActivate: [RoleGuard], data: { minimumRole: 3 } },
  { path: 'upload/:mediaID', component: UploadPageComponent, canActivate: [RoleGuard], data: { minimumRole: 3 } },
  { path: 'analytics', component: AnalyticsPageComponent, canActivate: [RoleGuard], data: { minimumRole: 2 } },
  { path: 'report/:reportType', component:AnalyticReportPageComponent, canActivate:[RoleGuard], data:{minimumRole : 2}},
  { path: 'report/:reportType/:reportID', component: AnalyticReportPageComponent, canActivate: [RoleGuard], data: { minimumRole: 2 } },
  { path: 'report/:reportType/:userFirst/:userLast/:userEmail', component: AnalyticReportPageComponent, canActivate: [RoleGuard], data: { minimumRole: 2 } },
  { path: 'search/:searchType/:searchTerm', component: SearchResultsComponent },
  { path: 'addchannel', component: AddchannelComponent, canActivate: [RoleGuard], data: { minimumRole: 4 } },
  { path: 'editchannel/:channelID/:level', component: EditchannelComponent, canActivate: [RoleGuard], data: { minimumRole: 3 } },
  { path: 'admin/user', component: UserAdminPageComponent, canActivate: [RoleGuard], canDeactivate: [UnsavedChangesGuard], data: { minimumRole: 4} },
  { path: 'admin/media', component: MediaAdminPageComponent, canActivate: [RoleGuard], canDeactivate: [UnsavedChangesGuard], data: { minimumRole: 3 } },
  { path: 'comment-queue', component: CommentQueuePageComponent, canActivate: [RoleGuard], data: { minimumRole: 2 } },
  { path: 'comment-audit-log', component: CommentAuditLogComponent, canActivate: [RoleGuard], data: { minimumRole: 2 } },
  { path: 'media-audit-log', component: MediaAuditLogComponent, canActivate: [RoleGuard], data: { minimumRole: 3 } },
  { path: 'admin-audit-log', component: AdminAuditLogComponent, canActivate: [RoleGuard], data: { minimumRole: 4 } },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: "admin/data-import-export", component: DataImportExportComponent },
  { path: 'profile-page', component: ProfilePageComponent },
  { path: 'change/:changeID', component: ChangeComponent, canActivate: [RoleGuard], data: { minimumRole: 2 } },
  { path: 'manage-comments', component: ManageCommentsComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {

}
