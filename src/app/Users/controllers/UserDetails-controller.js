'use strict';
/**
 * @ngdoc function
 * @name VettiverFaxApp.controller:UserEditCtrl
 * @description
 * # UserEditCtrl
 * Controller of the VettiverFaxApp
 */
angular.module('VettiverFaxApp').controller('UserDetailsCtrl',
  ['$scope', 'user', 'User', 'dialogs', '$state', '$log','DailySummary','Activity',
    function ($scope, user, User, dialogs, $state, $log,DailySummary,Activity) {
      if (!user) {
        user = new User();
      }
      $scope.subPage = 'Create';
      $scope.isCreate = true;
      $scope.newPost = {};
      $scope.notify = {};
      $scope.pushNotify = false;
      $scope.domainAdmin = User.getCachedCurrent();
      $scope.entryDomainName = $scope.domainAdmin.entryDomainName;
      $scope.enterpriseAdmin = ($scope.domainAdmin.domain.name === 'global') ?
        false: true;
      $scope.domain={

      };
      $scope.addManualSteps = function () {
        console.log($scope.manualSteps)
        var date = $scope.manualStepsDate.toUTCString()
        $scope.manualSteps = Number($scope.manualSteps);
        var data = {
          steps: $scope.manualSteps,
          stepsModifiedDate: date
        };
        User.prototype$enterManualSteps({
          id: user.id
        },data, function onSuccess(userDetails) {
          toastr.success('Steps added Successfully');
          $scope.manualStepsDate = "";
          $scope.manualSteps = "";
        },function onError() {
            alert('steps should be geater than existing steps');
          })
      }
      if (user.id) {
        $scope.subPage = 'Edit';
        $scope.isCreate = false;
      }
      else {
        $scope.editMode = true;
      }
      $scope.alert = {
        type: 'success',
        msg: 'hello there'
      };
      if (!$scope.isCreate) {
        var startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);
        Activity.find({filter : {
          where:{
            owner: user.id
          }
        }
        },function onSuccess(activities) {
            $scope.userActivities = activities;
          });
        User.activities({id: user.id, filter: {
          include: 'actor',
          where: {
            date: {
              gt: startOfToday
            },
            domainId: $scope.domainAdmin.domain.id
          }
        }}, function onSuccess(activities) {
            $scope.userActivitiesToday = activities.length;
          });

        User.prototype$__get__memberships({
            id: user.id,
            filter: {
              where: {
                domainId: $scope.domainAdmin.domain.id
              }, include: 'movement', order: 'totalSteps DESC'}
          },
          function onSuccess(memberships) {
            $scope.userMemberships = memberships;
          });
        User.prototype$stats({
            id: user.id
          },
          function onSuccess(stats) {
            $scope.userStats = stats;
          });
      }
      $scope.pristineUser = angular.copy(user);
      $scope.user = user;

      $scope.openTab = function (url) {
        var win = window.open(url, '_blank');
        win.focus();
      };
      $scope.clickToOpen = function () {
        //ngDialog.open({template: 'app/tpl/dialog.html'});
        //dialogs.useBackdrop('static');
        var dlg = dialogs.create('app/tpl/edit-image-dialog.html',
          'EditImageCtrl',
          $scope.user);
        dlg.result.then(function (value) {
          $scope.onImageUploadSuccess(value);

          //TODO: We should probably save the data right away.As of now, data is not saved. User has to click
          //the save button to activate the new profile picture
        }, function (value) {
          //TODO: handle error
        });
      };
      $scope.save = function (user) {
        Metronic.blockUI({
          target: '#user_details_form_portlet',
          animate: true
        });
        var postData = {};
        postData['entryDomainName'] = $scope.entryDomainName;
        if($scope.domains.indexOf('*')!=-1){
          for (var property in user) {
            if (!user.hasOwnProperty(property)) {
              continue;
            }
            if (['email','username','password'].indexOf(property) > -1) {
              postData[property] = user[property];
            }
            if (property === '_picture' && !user.id) {
              postData[property] = user[property];
            }
          }
        }
        else{
          $scope.user.domainEmail=$scope.user.domainEmail + $scope.domain.user;
          user.domainEmail = $scope.user.domainEmail;
          for (var property in user) {
            if (!user.hasOwnProperty(property)) {
              continue;
            }
            if (['email','username','password','domainEmail'].indexOf(property) > -1) {
              postData[property] = user[property];
            }
            if (property === '_picture' && !user.id) {
              postData[property] = user[property];
            }
          }
        }
        toastr.options.closeButton = true;
        if (postData.id) {
          User.prototype$updateAttributes({
            id: postData.id
          }, postData, function onSuccess(updatedUser) {
            toastr.success('User has been saved successfully!',
              'User Saved');
            $scope.pristineUser = angular.copy(updatedUser);
            $scope.user = updatedUser;
            Metronic.unblockUI('#user_details_form_portlet');
          }, function onError() {
            $log.error('error');
          });
        }
        else {
          User.create(postData, function onSuccess(newUser) {
            toastr.success('User has been created successfully!',
              'User Created');
            $scope.user = newUser;
            Metronic.unblockUI('#user_details_form_portlet');
            $state.go('users.details', {id: newUser.id})
          }, function onError(err) {
            $log.error('error', err);
          });
        }

      };


      $scope.submitDisabled = function () {
        var m = $scope.user;
        var p = $scope.pristineUser;
        var fields = ['email', 'password'];
        var changed = false;
        var allFieldsSet = true;
        for (var i = 0; i < fields.length; i++) {
          var field = fields[i];
          if (!m[field]) {
            allFieldsSet = false;
            break;
          }
          if (m[field] !== p[field]) {
            changed = true;
          }
        }
        if($scope.domainUser){
          if(($scope.domain && $scope.domain.user==undefined) || $scope.user.domainEmail==undefined )
            return !(changed && allFieldsSet) || true;
        }
        else{
            return !(changed && allFieldsSet);
        }
      };

      $scope.cancelEdit = function () {
        if ($scope.isCreate) {
          return $state.go('users.list');
        }
        $scope.editMode = false;
        $state.go('users.details', {id: user.id});
      };


      $scope.addPost = function (post,notify) {
        Metronic.blockUI({
          target: '#user-add-post-item',
          animate: true
        });
        var postData = {};
        for (var property in post) {
          if (!post.hasOwnProperty(property)) {
            continue;
          }
          if (['text', '_picture'].indexOf(property) > -1) {
            postData[property] = post[property];
          }
        }
        User.activities.create({id: $scope.user.id}, postData,
          function onSuccess(newPost) {
            if (!newPost.actor) {
              newPost.actor = User.getCachedCurrent()
            }
            $scope.userActivities.unshift(newPost);
            if(!notify.hasOwnProperty('contextType')) {
              notify.contextType = 'Post';
              notify.contextId = newPost.id;
            }
            $scope.newPost = {};
            if ($scope.userStats) {
              $scope.userStats.activities += 1;
            }
            if ($scope.pushNotify) {
              postData = {};
              for (var property in notify) {
                if (!notify.hasOwnProperty(property)) {
                  continue;
                }
                if (['message', '_picture', 'contextId',
                    'contextType'].indexOf(property) > -1) {
                  postData[property] = notify[property];
                }
              }
              User.prototype$notify({id: $scope.user.id}, postData,
                function onSuccess(newNotify){
                  $scope.notify = {};
                  postData = {};
                }, function onError() {
                  $log.error('error');
                });
            }
            Metronic.unblockUI('#user-add-post-item');
          }, function onError() {
            $log.error('error');
          });
      };

      $scope.addPictureToPost = function () {
        $scope.newPost.type = "user";
        var dlg = dialogs.create('app/tpl/edit-image-dialog.html',
          'EditImageCtrl',
          $scope.newPost);
        dlg.result.then(function (value) {
          $scope.newPost._picture = value;
          $scope.notify._picture = value;
          $scope.notify.contextId = value.id;
          $scope.notify.contextType = 'Image';
          //$scope.postImage = $scope.user._picture.url;
          //TODO: We should probably save the data right away.As of now, data is not saved. User has to click
          //the save button to activate the new profile picture
        }, function (value) {
          //TODO: handle error
        });
      };

      $scope.onImageUploadSuccess = function (data) {
        if ($scope.user.id) {
          User.prototype$linkPicture({
            id: $scope.user.id
          }, data, function onSuccess(value) {
            $scope.user._picture = value;
          }, function onError() {
            //TODO: handle error
            $log.error('error');
          });
        }
        else {
          $scope.user._picture = data;
        }
      };

      $scope.averageSteps = function (membership) {
        var joinDate = new Date(membership.joinDate);
        var today = new Date();
        var diffInMiliSeconds = today.getTime() - joinDate.getTime();
        var diffInDays = diffInMiliSeconds / (1000 * 60 * 60 * 24);
        return Math.floor(membership.totalSteps / diffInDays);
      };
      $scope.isNotSelf = function (user) {
        if (user.id !== User.getCachedCurrent().id) {
          return true;
        }
        return false;
      };
      $scope.isAdmin = function (user) {

        if (!user || !user.roles || user.roles.length === 0) {
          return false;
        }
        for (var i = 0; i < user.roles.length; i++) {
          var role = user.roles[i];
          if (role.name === 'admin') {
            return true;
          }
        }
        return false;
      };

      $scope.makeAdmin = function (user) {
        if (user.id === User.getCachedCurrent().id) {
          alert('cannot modify your own roles');
          return;
        }
        User.prototype$patchRoles({
          id: user.id
        }, {roleName: 'admin', op: 'add'}, function onSuccess(role) {
          user.roles.push(role);
        })
      };

      $scope.removeAdmin = function (user) {
        if (user.id === User.getCachedCurrent().id) {
          alert('cannot modify your own roles');
          return;
        }

        var roleToRemove = null;
        var index = 0;
        for (var i = 0; i < user.roles.length; i++) {
          var role = user.roles[i];
          if (role.name === 'admin') {
            roleToRemove = role;
            index = i;
            break;
          }
        }
        if (!roleToRemove) {
          $log.debug('nothing to remove');
          return;
        }
        User.prototype$patchRoles({
          id: user.id
        }, {roleId: roleToRemove.id, op: 'delete'}, function onSuccess(role) {
          user.roles.splice(index);
        })
      }

      $scope.getDomains=function(){
        User.prototype$__get__domains({
          id:$scope.domainAdmin.id
        },function onSuccess(domains){
          $scope.domains=domains[0].validEmailExtensions;
          if($scope.domains.indexOf('*')!=-1){
            $scope.domainUser=false;
          }
          else{
            for(var i=0;i<$scope.domains.length;i++){
              $scope.domains[i]='@'+ $scope.domains[i];
            }
            $scope.domainUser=true;
          }

        })

      }
      $scope.getDomains();

      $scope.dailySummeries=function(userId){
        User.prototype$__get__dailySummaries({
          id:userId
        },function onSuccess(dailySummery){
          $scope.dailySummeries=dailySummery;
          $scope.totalWeeklySteps=0;
          for(var i=0;i<dailySummery.length;i++){
            $scope.totalWeeklySteps+=dailySummery[i].totalSteps;
          }
        })
      }

      $scope.clickToOpen = function () {
        $scope.user.type = "user";
        var dlg = dialogs.create('app/tpl/edit-image-dialog.html',
          'EditImageCtrl',
          $scope.user);
        dlg.result.then(function (value) {
          $scope.onImageUploadSuccess(value);
        }, function (value) {

        });
      };

      $scope.onImageUploadSuccess = function (data) {
        if ($scope.user.id) {
          User.prototype$linkPicture({
            id: $scope.user.id
          }, data, function onSuccess(value) {
            $log.debug('image linked to user:', $scope.user.id);
            $scope.user._picture = value;
          }, function onError() {
            //TODO: handle error
            $log.error('error');
          });
        }
        else {
          $scope.user._picture = data;
        }
      };

      $scope.removeUser = function (user) {
        User.prototype$revokeEnterpriseAccess({
          id: user.id
        }, {}, function onSuccess(value) {
          return $state.go('users.list');
        }, function onError() {
          $log.error('error');
        });
      }

    }]);
