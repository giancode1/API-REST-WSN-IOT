import Node, { INode } from '../libs/models/node.model';
import boom from '@hapi/boom';

class NodeService {
  async find(): Promise<INode[]> {
    const nodes = await Node.find();
    if (!nodes) throw boom.notFound('No nodes found');
    return nodes;
  }

  async create(data: INode): Promise<INode> {
    const newNode = new Node(data);
    return await newNode.save();
  }

  async findById(id: string): Promise<INode> {
    // const node = await Node.findById(id).populate({path: 'userId', select: 'name -_id'});
    const node = await Node.findById(id)
      .populate('userId', 'name')
      // .populate('sensors')
      // .populate('sensors', 'name')
      .populate({ path: 'sensors', select: 'name description -nodeId' });
    if (!node) throw boom.notFound('Node not found');
    // delete node.userId.id
    // console.log("node::",node,"..se acabo")
    return node;
  }

  async update(id: string, data: INode): Promise<INode> {
    const node = await Node.findByIdAndUpdate(id, data);
    if (!node) throw boom.notFound('Node not found');
    return node;
  }

  async delete(id: string): Promise<INode> {
    const node = await Node.findByIdAndDelete(id);
    if (!node) throw boom.notFound('Node not found');
    return node;
  }
}

export default NodeService;
