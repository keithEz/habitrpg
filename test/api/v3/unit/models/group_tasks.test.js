import { model as Challenge } from '../../../../../website/server/models/challenge';
import { model as Group } from '../../../../../website/server/models/group';
import { model as User } from '../../../../../website/server/models/user';
import * as Tasks from '../../../../../website/server/models/task';
import common from '../../../../../common/';
import { each, find } from 'lodash';

describe('Group Task Methods', () => {
  let guild, leader, challenge, task;
  let tasksToTest = {
    habit: {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
    },
    todo: {
      text: 'test todo',
      type: 'todo',
    },
    daily: {
      text: 'test daily',
      type: 'daily',
      frequency: 'daily',
      everyX: 5,
      startDate: new Date(),
    },
    reward: {
      text: 'test reward',
      type: 'reward',
    },
  };

  beforeEach(async () => {
    guild = new Group({
      name: 'test party',
      type: 'guild',
    });

    leader = new User({
      guilds: [guild._id],
    });

    guild.leader = leader._id;

    challenge = new Challenge({
      name: 'Test Challenge',
      shortName: 'Test',
      leader: leader._id,
      group: guild._id,
    });

    leader.challenges = [challenge._id];

    await Promise.all([
      guild.save(),
      leader.save(),
      challenge.save(),
    ]);
  });

  each(tasksToTest, (taskValue, taskType) => {
    context(`${taskType}`, () => {
      beforeEach(async() => {
        task = new Tasks[`${taskType}`](Tasks.Task.sanitize(taskValue));
        task.group.id = guild._id;
        await task.save();
      });

      it('syncs an assigned task to a user', async () => {
        await guild.syncTask(task, leader);

        let updatedLeader = await User.findOne({_id: leader._id});
        let updatedLeadersTasks = await Tasks.Task.find({_id: { $in: updatedLeader.tasksOrder[`${taskType}s`]}});

        let syncedTask = find(updatedLeadersTasks, function findNewTask (updatedLeadersTask) {
          return updatedLeadersTask.linkedTaskId === task._id;
        });

        expect(syncedTask).to.exist;
      });

      xit('scores an assigned task', async () => {
        let updatedTaskName = 'Updated Test Habit';
        await challenge.addTasks([task]);

        let req = {
          body: { text: updatedTaskName },
        };

        Tasks.Task.sanitize(req.body);
        _.assign(task, common.ops.updateTask(task.toObject(), req)[0]);

        await challenge.updateTask(task);

        let updatedLeader = await User.findOne({_id: leader._id});
        let updatedUserTask = await Tasks.Task.findById(updatedLeader.tasksOrder[`${taskType}s`][0]);

        expect(updatedUserTask.text).to.equal(updatedTaskName);
      });

      xit('removes an assigned task and unlinks assignees', async () => {
        await challenge.addTasks([task]);
        await challenge.removeTask(task);

        let updatedLeader = await User.findOne({_id: leader._id});
        let updatedUserTask = await Tasks.Task.findOne({_id: updatedLeader.tasksOrder[`${taskType}s`][0]}).exec();

        expect(updatedUserTask.challenge.broken).to.equal('TASK_DELETED');
      });

      it('unlinks and deletes challenge tasks for a user when remove-all is specified', async () => {
        await guild.syncTask(task, leader);
        await guild.unlinkTask(task, leader, 'remove-all');

        let updatedLeader = await User.findOne({_id: leader._id});
        let updatedLeadersTasks = await Tasks.Task.find({_id: { $in: updatedLeader.tasksOrder[`${taskType}s`]}});
        let syncedTask = find(updatedLeadersTasks, function findNewTask (updatedLeadersTask) {
          return updatedLeadersTask.linkedTaskId === task._id;
        });

        expect(syncedTask).to.not.exist;
      });

      it('unlinks and keeps challenge tasks for a user when keep-all is specified', async () => {
        await guild.syncTask(task, leader);
        await guild.unlinkTask(task, leader, 'keep-all');

        let updatedLeader = await User.findOne({_id: leader._id});
        let updatedLeadersTasks = await Tasks.Task.find({_id: { $in: updatedLeader.tasksOrder[`${taskType}s`]}});
        let syncedTask = find(updatedLeadersTasks, function findNewTask (updatedLeadersTask) {
          return updatedLeadersTask.linkedTaskId === task._id;
        });

        expect(syncedTask).to.exist;
        expect(syncedTask.challenge._id).to.be.empty;
      });
    });
  });
});
