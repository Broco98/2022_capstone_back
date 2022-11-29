/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Object representing a user's cursor position on the workspace.
 * @author navil@google.com (Navil Perez)
 */

import * as Blockly from 'blockly';

export default class Position {
  constructor(type, blockId, fieldName) {
    this.type = type;
    this.blockId = blockId;
    this.fieldName = fieldName;
    console.log("position_constructed")
  };

  /**
   * Create a Position from an event. Currently supports creating Positions for
   * blocks from a 'selected' UI event.
   * @param {!Blockly.Events.Abstract} event The event that creates a Position.
   * @return {!PositionUpdate} The Position representative of the event.
   * @public
   */
  static fromEvent(event) {
    console.log("from")
    if (event.type === Blockly.Events.SELECTED) {
      console.log("selected");
      return this.fromSelectedUiEvent_(event);
    } else if (event.type === Blockly.Events.CHANGE &&
        event.element === 'field') {
         console.log("changed");
      return this.fromFieldChangeEvent_(event);
    } else {
      throw Error('Cannot create position from this event.');
    }
  };

  static fromSelectedUiEvent_(event) {
    console.log("return block position - selected");
    const type = 'BLOCK';
    const blockId = event.newElementId;
    const fieldName = null;
    return new Position(type, blockId, fieldName);
  };

  static fromFieldChangeEvent_(event) {
    console.log("return block position - Feild");
    const type = 'FIELD';
    const blockId = event.blockId;
    const fieldName = event.name;
    return new Position(type, blockId, fieldName);
  };

  static fromJson(json) {
    console.log("json to position");
    return new Position(json.type, json.blockId, json.fieldName);
  };

  hasValidPosition() {
    console.log("check position is right");
    if (this.type == 'FIELD' && this.blockId && this.fieldName) {
      return true;
    } else if (this.type == 'BLOCK' && this.blockId) {
      return true;
    } else {
      console.log("false");
      return false;
    };
  };

  toMarker(workspace) {
    console.log("highlight");
    const marker = new Blockly.Marker();
    const node = this.createNode(workspace);
    marker.setCurNode(node);
    return marker;
  };

  createNode(workspace) {
    console.log("try_create_node")
    if (!this.hasValidPosition()) {
      return null;
    };
    if (this.type == 'BLOCK') {
      return this.createBlockNode_(workspace);
    } else if (this.type == 'FIELD') {
      return this.createFieldNode_(workspace);
    };
  };

  createBlockNode_(workspace) {
    console.log("create_block")
    const block = workspace.getBlockById(this.blockId);
    return Blockly.ASTNode.createBlockNode(block);
  };

  createFieldNode_(workspace) {
    console.log("create_block-field")
    const block = workspace.getBlockById(this.blockId);
    const field = block.getField(this.fieldName);
    return Blockly.ASTNode.createFieldNode(field);
  };
};
