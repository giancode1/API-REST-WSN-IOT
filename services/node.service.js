require('../libs/mongoose'); //conexion
const boom = require('@hapi/boom');
const Node = require('../libs/models/node.model');

class NodeService {
  constructor() {

  }
  async find() {

    const nodes = await Node.find()
    return nodes;
  }

  async create(data) {
    const newNode = await Node(data);
    return await newNode.save();
  }

  async findById(id) {
    const node = await Node.findById(id)
    .populate('userId', 'name')
    .populate({path: 'sensors', select: 'name description -nodeId'})
    if(!node){
      throw boom.notFound('node not found');  
    }
    return node;
  }

  async update(id, changes) {
    const node = await Node.findByIdAndUpdate(id, changes);
    if(!node){
      throw boom.notFound('node not found');  
    }
    return node;
  }

  async delete(id) {
    const node = await Node.findByIdAndDelete(id);
    if(!node){
      throw boom.notFound('node not found');  
    }
    return node;
  }
}

module.exports = NodeService;
