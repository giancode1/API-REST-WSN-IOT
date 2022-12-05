import '../libs/mongoose'; // conexion
import boom from '@hapi/boom';
import Node from '../libs/models/node.model';
class NodeService {
  async find() {
    const nodes = await Node.find();
    return nodes;
  }

  async create(data: any) {
    const newNode = new Node(data);
    return await newNode.save();
  }

  async findById(id: string) {
    // const node = await Node.findById(id).populate({path: 'userId', select: 'name -_id'});
    const node = await Node.findById(id)
      .populate('userId', 'name')
      // .populate('sensors')
      // .populate('sensors', 'name')
      .populate({ path: 'sensors', select: 'name description -nodeId' });
    if (!node) {
      throw boom.notFound('node not found');
    }
    // delete node.userId.id
    // console.log("node::",node,"..se acabo")
    return node;
  }

  async update(id: string, changes: any) {
    const node = await Node.findByIdAndUpdate(id, changes);
    if (!node) {
      throw boom.notFound('node not found');
    }
    return node;
  }

  async delete(id: string) {
    const node = await Node.findByIdAndDelete(id);
    if (!node) {
      throw boom.notFound('node not found');
    }
    return node;
  }
}

export default NodeService;
