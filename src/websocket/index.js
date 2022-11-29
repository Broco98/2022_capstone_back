import * as Blockly from 'blockly';
import { getSnapshot, getEvents, writeEvents, getBroadcast } from './workspace_client_handlers';
import {
  getPositionUpdates, sendPositionUpdate, getBroadcastPositionUpdates,
  connectUser, getUserDisconnects
} from './user_data_handlers';
import UserDataManager from '../UserDataManager';
import WorkspaceClient from '../WorkspaceClient';

document.addEventListener('DOMContentLoaded', async () => {
  const workspace = Blockly.inject('blocklyDiv',
    {
      toolbox: document.getElementById('toolbox'),
      media: 'media/',
    });
  const workspaceClient = new WorkspaceClient(
    workspace.id, getSnapshot, getEvents, writeEvents, getBroadcast);
  workspaceClient.listener.on('runEvents', (eventQueue) => {
    runEvents_(eventQueue);
  });
  await workspaceClient.start();

  const userDataManager = new UserDataManager(workspace.id, sendPositionUpdate,
    getPositionUpdates, getBroadcastPositionUpdates);
  await userDataManager.setPresenceHandlers(connectUser, getUserDisconnects);
  await userDataManager.start();

  workspace.addChangeListener((event) => {
    if (event.type === Blockly.Events.SELECTED ||
      (event.type === Blockly.Events.CHANGE && event.element === 'field')) {
      userDataManager.handleEvent(event);
    }
    if (event.isUiEvent) {
      return;
    }
    workspaceClient.activeChanges.push(event);
    if (!Blockly.Events.getGroup()) {
      workspaceClient.flushEvents();
    }
  });

  function runEvents_(eventQueue) {
    eventQueue.forEach((workspaceAction) => {
      Blockly.Events.disable();
      workspaceAction.event.run(workspaceAction.forward);
      Blockly.Events.enable();
    });
  };
});
