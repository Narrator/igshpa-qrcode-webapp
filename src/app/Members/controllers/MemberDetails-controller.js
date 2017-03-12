'use strict';
/**
 * @ngdoc function
 * @name VettiverFaxApp.controller:MemberDetailsCtrl
 * @description
 * # MemberDetailsCtrl
 * Controller of the VettiverFaxApp
 */
angular.module('VettiverFaxApp').controller('MemberDetailsCtrl',
  ['$window', '$scope', 'member','$timeout','Member', 'dialogs', '$state', '$stateParams', 'User', '$log', '$http', 'EnvironmentConfig', 'LoopBackAuth',
    function ($window, $scope, member, $timeout, Member, dialogs, $state, $stateParams, User, $log, $http, EnvironmentConfig, LoopBackAuth) {
      if (!member) {
        member = new Member();
      }
      $scope.accessToken = LoopBackAuth.accessTokenId;
      $scope.apiUrl = EnvironmentConfig.API_URL;
      $scope.memberImg = $scope.apiUrl +
          "/members/" + member.id + "/getImage?access_token=" +
          $scope.accessToken;
      $scope.domainAdmin = User.getCachedCurrent();
      $scope.subPage = 'Create';
      $scope.isCreate = true;
      $scope.newPost = {};
      $scope.editMode = false;
      if (member.id) {
        $scope.subPage = 'Edit';
        $scope.isCreate = false;
      }
      else {
        $scope.editMode = true;
      }

      $scope.deletePage = 1;

      $scope.alert = {
        type: 'success',
        msg: 'hello there'
      };

      $scope.pristineMember = angular.copy(member);
      $scope.member = member;

      $scope.clear = function () {
        $scope.dt = null;
      };

      $scope.open = function ($event, selector) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = $scope.opened || {};
        $scope.opened[selector] = true;
      };

      $scope.openTab = function (url) {
        var win = window.open(url, '_blank');
        win.focus();
      };

      $scope.save = function (member) {
        console.log("in save");
        Metronic.blockUI({
          target: '#member_details_form_portlet',
          animate: true
        });
        var postData = {};
        if (!member.username || member.username != 'igshpaAdmin') {
          var passString = Math.floor(Math.random()* 900000000);
          postData['username'] =  'user-' + passString.toString();
          postData['password'] = passString.toString();
        }
        for (var property in member) {
          if (!member.hasOwnProperty(property)) {
            continue;
          }
          if (['nickName', 'firstName', 'lastName', 'title', 'company',
              'city', 'state', 'country', 'zip', 'address', 'phone1', 'phone2',
              'email', 'attendeetype'].indexOf(property) > -1) {
            postData[property] = member[property];
          }

        }
        toastr.options.closeButton = true;
        if (member.id) {
          Member.prototype$patchAttributes({
            id: member.id
          }, postData, function onSuccess(updatedMember) {
            toastr.success('Member has been saved successfully!',
              'Member Saved');

            $scope.member = updatedMember;
            $scope.pristineMember = angular.copy($scope.member);
            Metronic.unblockUI('#member_details_form_portlet');
            $scope.editMode = false;
            $scope.generateBadge(member);
            $state.go('members.details', {id: $scope.member.id});
          }, function onError() {
            $log.error('error');
          });
        }
        else {
          console.log("in create Member",postData);
          Member.create(postData, function onSuccess(newMember) {
            console.log("success");
            toastr.success('Member has been created successfully!',
              'Member Created');
            $scope.member = newMember;
            Metronic.unblockUI('#member_details_form_portlet');
            $scope.generateBadge(newMember);
            $state.go('members.details', {id: newMember.id})
          }, function onError() {
            $log.error('error');
          });
        }
      }
      $scope.isChanged = function () {
        var m = $scope.member;
        var p = $scope.pristineMember;
        var fields = ['nickName', 'firstName', 'lastName', 'title', 'company',
              'city', 'state', 'country', 'zip', 'address', 'phone1', 'phone2',
              'email', 'attendeeType'];
        if ($scope.editMode) {
          for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (typeof m[field] === 'object' && typeof p[field] === 'object') {
              if (m[field].id && m[field].id !== p[field].id) {
                return false;
              }
            }
            else if (m[field] !== p[field]) {
              return false;
            }
          }
          return true;
        }
      }

      $scope.submitDisabled = function () {
        var m = $scope.member;
        var p = $scope.pristineMember;
        var requiredFields = ['nickName', 'firstName', 'lastName'];
        var changed = false;
        var allFieldsSet = true;
        for (var i = 0; i < requiredFields.length; i++) {
          var field = requiredFields[i];
          if (!m[field]) {
            allFieldsSet = false;
            break;
          }
          if (m[field] !== p[field]) {
            changed = true;
          }
        }
        var otherFields = ['email', 'company', 'title', 'city', 'state', 'country', 'zip',
                          'address', 'phone1', 'phone2', 'attendeeType'];
        for (var i = 0; i < otherFields.length; i++) {
          var field = otherFields[i];
          if (typeof m[field] === 'object' && typeof p[field] === 'object') {
            if (m[field].id && m[field].id !== p[field].id) {
              changed = true;
              break;
            }
          }
          else if (m[field] !== p[field]) {
            changed = true;
            break;
          }
        }
        return !(changed && allFieldsSet);
      };

      $scope.cancelEdit = function () {
        if ($scope.isCreate) {
          return $state.go('members.list');
        }
        $scope.editMode = false;
        $state.go('members.details', {id: member.id});
      };
      $scope.printBadge = function (member) {
        var html = "<html><head>" +
                        "</head>" +
                        "<body  style ='-webkit-print-color-adjust:exact;'>"+
                        "<img src=\"" +
                        $scope.apiUrl +
          "/members/" + member.id + "/getImage?access_token=" +
          $scope.accessToken + "\" onload=\"javascript:window.print();\"/>" +
                        "</body>";
        var win = window.open("about:blank","_blank");
        win.document.write(html);
      };

      function dataURItoBlob(dataURI, callback) {
          // convert base64 to raw binary data held in a string
          // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
          var byteString = atob(dataURI.split(',')[1]);

          // separate out the mime component
          var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

          // write the bytes of the string to an ArrayBuffer
          var ab = new ArrayBuffer(byteString.length);
          var ia = new Uint8Array(ab);
          for (var i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
          }

          // write the ArrayBuffer to a blob, and you're done
          var bb = new Blob([ab]);
          callback(bb);
      }

      var saveData = (function () {
          var a = document.createElement("a");
          document.body.appendChild(a);
          a.style = "display: none";
          return function (data, fileName) {
              dataURItoBlob(data, function (blob) {
                var url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = fileName;
                a.click();
                window.URL.revokeObjectURL(url);
              });
          };
      }());

      $scope.generateBadge = function(member) {
        Member.prototype$generateBadge({
          id: member.id
        }, function onSuccess(updatedMember) {
          toastr.success('Badge has been succesfully generated');
          var imgUrl = $scope.apiUrl + "/members/" + member.id +
            '/getImage?access_token=' + $scope.accessToken
          toDataUrl(imgUrl, function(base64Img) {
            saveData(base64Img, updatedMember.firstName + '-' +
              updatedMember.lastName + '.png');
            //window.location = base64Img;
            //newWindow=window.open(base64Img, 'filename.png');
          });
          //$window.location.reload();
        }, function onError() {
          $log.error('error');
        });
      }
}]);
