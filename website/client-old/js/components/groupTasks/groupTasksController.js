habitrpg.controller('GroupTasksCtrl', ['$scope', 'Shared', 'Tasks', 'User', function ($scope, Shared, Tasks, User) {
    $scope.editTask = Tasks.editTask;
    $scope.toggleBulk = Tasks.toggleBulk;
    $scope.cancelTaskEdit = Tasks.cancelTaskEdit;

    function addTask (listDef, task) {
      var task = Shared.taskDefaults({text: task, type: listDef.type});
      //If the group has not been created, we bulk add tasks on save
      var group = $scope.obj;
      if (group._id) Tasks.createGroupTasks(group._id, task);
      if (!group[task.type + 's']) group[task.type + 's'] = [];
      group[task.type + 's'].unshift(task);
      delete listDef.newTask;
    };

    $scope.addTask = function(listDef) {
      Tasks.addTasks(listDef, addTask);
    };

    $scope.removeTask = function(task, group) {
      if (!Tasks.removeTask(task)) return;
      //We only pass to the api if the group exists, otherwise, the tasks only exist on the client
      if (group._id) Tasks.deleteTask(task._id);
      var index = group[task.type + 's'].indexOf(task);
      group[task.type + 's'].splice(index, 1);
    };

    $scope.saveTask = function(task, stayOpen, isSaveAndClose) {
      Tasks.saveTask (task, stayOpen, isSaveAndClose);
      Tasks.updateTask(task._id, task);
    };

    $scope.shouldShow = function(task, list, prefs){
      return true;
    };

    $scope.canEdit = function(task) {
      return true;
    };

    /*
    ------------------------
    Tags
    ------------------------
    */
    $scope.updateTaskTags = function (tagId, task) {
      var tagIndex = task.tags.indexOf(tagId);
      if (tagIndex === -1) {
        Tasks.addTagToTask(task._id, tagId);
        task.tags.push(tagId);
      } else {
        Tasks.removeTagFromTask(task._id, tagId);
        task.tags.splice(tagIndex, 1);
      }
    };

     /*
      ------------------------
      Checklists
      ------------------------
      */
<<<<<<< HEAD
     $scope.addChecklist = Tasks.addChecklist;

     $scope.addChecklistItem = Tasks.addChecklistItemToUI;

     $scope.removeChecklistItem = Tasks.removeChecklistItemFromUI;

     $scope.swapChecklistItems = Tasks.swapChecklistItems;

     $scope.navigateChecklist = Tasks.navigateChecklist;

     $scope.checklistCompletion = Tasks.checklistCompletion;

     $scope.collapseChecklist = function (task) {
       Tasks.collapseChecklist(task);
       //@TODO: Currently the api save of the task is separate, so whenever we need to save the task we need to call the respective api
       Tasks.updateTask(task._id, task);
     };
=======
     function focusChecklist(task,index) {
       window.setTimeout(function(){
         $('#task-'+task._id+' .checklist-form input[type="text"]')[index].focus();
       });
     }

     $scope.addChecklist = function(task) {
       task._edit.checklist = [{completed:false, text:""}];
       focusChecklist(task._edit,0);
     }

     $scope.addChecklistItem = function(task, $event, $index) {
       if (task._edit.checklist[$index].text) {
         if ($index === task._edit.checklist.length - 1) {
           task._edit.checklist.push({ completed: false, text: '' });
         }
         focusChecklist(task._edit, $index + 1);
       } else {
         // TODO Provide UI feedback that this item is still blank
       }
     }

     $scope.removeChecklistItem = function(task, $event, $index, force) {
       // Remove item if clicked on trash icon
       if (force) {
         task._edit.checklist.splice($index, 1);
       } else if (!task._edit.checklist[$index].text) {
         // User deleted all the text and is now wishing to delete the item
         // saveTask will prune the empty item
         // Move focus if the list is still non-empty
         if ($index > 0)
           focusChecklist(task._edit, $index-1);
         // Don't allow the backspace key to navigate back now that the field is gone
         $event.preventDefault();
       }
     }

     $scope.swapChecklistItems = function(task, oldIndex, newIndex) {
       var toSwap = task._edit.checklist.splice(oldIndex, 1)[0];
       task._edit.checklist.splice(newIndex, 0, toSwap);
     }

     $scope.navigateChecklist = function(task,$index,$event){
       focusChecklist(task, $event.keyCode == '40' ? $index+1 : $index-1);
     }

     $scope.checklistCompletion = function(checklist){
       return _.reduce(checklist,function(m,i){return m+(i.completed ? 1 : 0);},0)
     }

     $scope.collapseChecklist = function(task) {
       task.collapseChecklist = !task.collapseChecklist;
       $scope.saveTask(task,true);
     }
>>>>>>> Updatd with new checklist logic and fixed columns
  }]);
