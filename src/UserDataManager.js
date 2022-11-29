import * as Blockly from 'blockly';
import Position from './Position';

export default class UserDataManager {
  constructor(workspaceId, sendPositionUpdate, getPositionUpdates,
      getBroadcastPositionUpdates) {
    this.workspaceId = workspaceId;
    this.colours = [
        '#fcba03', '#03fc20', '#03f0fc', '#035efc', '#5603fc', '#fc03d2'];
    this.sendPositionUpdate = sendPositionUpdate;
    this.getPositionUpdates = getPositionUpdates;
    this.getBroadcastPositionUpdates = getBroadcastPositionUpdates;
    this.getUserDisconnects = null;
  };

  /**
   * Initialize the workspace by creating and registering markers for all active
   * users and activating the handling of recieving PositionUpdates from the server.
   * @public
   */
  async start() {
    const positionUpdates = await this.getPositionUpdates();
    positionUpdates.forEach((positionUpdate) => {
      this.createMarker_(positionUpdate);
    });
    if (this.getBroadcastPositionUpdates) {
      this.getBroadcastPositionUpdates(this.updateMarkerPositions_.bind(this));
    } else {
      this.pollServer_();
    };
    if (this.getUserDisconnects) {
      this.getUserDisconnects(this.disposeMarker_.bind(this));
    };
  };

  async setPresenceHandlers(connectUserHandler, getUserDisconnectsHandler) {
    this.getUserDisconnects = getUserDisconnectsHandler;
    await connectUserHandler(this.workspaceId);
  };

  /**
   * Create a PositionUpdate from a Blockly event and send it to the server.
   * @param {!Blockly.Events.Abstract} event The event for which to create a
   *    PositionUpdate.
   * @public
   */
  async handleEvent(event) {
    const position = Position.fromEvent(event);
    await this.sendPositionUpdate({
      workspaceId: this.workspaceId,
      position: position
    });
  };

  /**
   * Periodically query the database for PositionUpdates.
   * @private
   */
  async pollServer_() {
    const positionUpdates = await this.getPositionUpdates();
    await this.updateMarkerPositions_(positionUpdates);
    setTimeout(() => {
      this.pollServer_();
    }, 5000)
  };

  /**
   * Get the workspace that corresponds to workspaceId.
   * @return {Blockly.Workspace} The sought after workspace or null if not found.
   * @private
   */  
  getWorkspace_() {
    return Blockly.Workspace.getById(this.workspaceId);
  };

  /**
   * Get the MarkerManager for the workspace.
   * @return {Blockly.MarkerManager} The sought after MarkerManager or null if not
   * found.
   * @private
   */  
  getMarkerManager_() {
    return this.getWorkspace_() ?
        this.getWorkspace_().getMarkerManager(): null;
  };

  getColour_() {
    const colour = this.colours.shift();
    this.colours.push(colour);
    return colour;
  };

  createMarker_(positionUpdate) {
    if (!this.getMarkerManager_()) {
      throw Error('Cannot create a Marker without Blockly MarkerManager.');
    };
    const position = positionUpdate.position;
    const marker = position.toMarker(this.getWorkspace_());
    marker.colour = this.getColour_();
    this.getMarkerManager_().registerMarker(positionUpdate.workspaceId, marker)
    marker.setCurNode(position.createNode(this.getWorkspace_()));
    return marker;
  };

  disposeMarker_(workspaceId) {
    if (!this.getMarkerManager_()) {
      throw Error('Cannot dispose of a Marker without Blockly MarkerManager.');
    };
    try {
      this.getMarkerManager_().unregisterMarker(workspaceId);
    } catch {};
  };

  getMarker(workspaceId) {
    return this.getMarkerManager_() ?
        this.getMarkerManager_().getMarker(workspaceId) : null;
  };

  /**
   * Updates curNode on a Marker based on MarkerPosition.
   * @param {!<Array.<!PositionUpdate>>} positionUpdates The PositionUpdates which
   * contain the new MarkerPositions.
   * @private
   */
  async updateMarkerPositions_(positionUpdates) {
    const filteredPositionUpdates = positionUpdates.filter(
        positionUpdate => positionUpdate.workspaceId != this.workspaceId);
    filteredPositionUpdates.forEach((positionUpdate) => {
      const position = positionUpdate.position;
      const node = position.createNode(this.getWorkspace_());
      if (this.getMarker(positionUpdate.workspaceId)) {
        this.getMarker(positionUpdate.workspaceId).setCurNode(node);
      } else {
        this.createMarker_(positionUpdate).setCurNode(node);        
      };
    });
  };
};
