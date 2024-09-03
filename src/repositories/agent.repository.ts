import { AppDataSource } from '../connection';
import { Agent } from '../entities/agent';
import { BadRequestError } from '../errors/badRequestError';
import { AgentEnums } from '../enums/agentEnums';

export const AgentRepository = AppDataSource.getRepository(Agent).extend({
  async createOrUpdate(obj: Partial<Agent>): Promise<Agent> {
    const exists = await this.findOne({
      where: {
        type: obj.type,
        name: obj.name,
      },
    });
    if (exists) {
      this.merge(exists, obj);
      return await this.save(exists);
    }
    return await this.save(obj);
  },
  async updateAgent(obj: Partial<Agent>): Promise<Agent> {
    const agent = await this.findOne({
      where: {
        id: obj.id,
      },
    });
    if (!agent) {
      throw new BadRequestError('Agent not found!');
    }
    this.merge(agent, obj);
    return await this.save(agent);
  },
  async findByTypeAndName({ type, name }: { type: AgentEnums; name: string }) {
    const agent = await this.findOne({
      where: {
        type: type,
        name: name,
      },
      relations: ['coupon'],
    });
    if (!agent) {
      throw new BadRequestError('Agent not found!');
    }
    return agent;
  },
  async oneById(id: number): Promise<Agent> {
    const agent = await this.findOne({
      where: {
        id: id,
      },
      relations: ['coupon'],
    });
    if (!agent) {
      throw new BadRequestError('Agent not found!');
    }
    return agent;
  },
  async list({
    current,
    pageSize,
    queryString,
    type,
  }: {
    current?: number;
    pageSize?: number;
    queryString?: string;
    type?: AgentEnums;
  }): Promise<[Agent[], number]> {
    const query = this.createQueryBuilder('agent').leftJoinAndSelect(
      'agent.coupon',
      'coupon',
    );
    if (queryString) {
      query.where('agent.name like :name', { name: `%${queryString}%` });
    }
    if (type) {
      query.andWhere('agent.type = :type', { type: type });
    }
    if (pageSize) {
      query.skip((current - 1) * pageSize).take(pageSize);
    }
    return await query.orderBy('agent.updatedAt', 'DESC').getManyAndCount();
  },
  async duplicateAgent(id: number): Promise<Agent> {
    const agent = await this.findOne({
      where: {
        id: id,
      },
      relations: ['coupon'],
    });
    if (!agent) {
      throw new BadRequestError('Agent not found!');
    }
    const newAgent = new Agent();
    this.merge(newAgent, agent);
    newAgent.name = `${agent.name} - Copy`;
    delete newAgent.id;
    return await this.save(newAgent);
  },
  async deleteAgent(id: number): Promise<void> {
    const agent = await this.findOne({
      where: {
        id: id,
      },
    });
    if (!agent) {
      throw new BadRequestError('Agent not found!');
    }
    await this.remove(agent);
  },
});
