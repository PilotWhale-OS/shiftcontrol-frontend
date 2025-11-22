import {BaseWorkflow} from './base.workflow';
import {LoginWorkflow} from '../e2e/basic/login/login.workflow';

const registry: Record<string, () => BaseWorkflow> = {};

export class WorkflowFactory {
  static register(name: string, factory: () => BaseWorkflow): void {
    registry[name] = factory;
  }

  static get<T extends BaseWorkflow>(name: string): T {
    const factory = registry[name];
    if (!factory) throw new Error(`No workflow registered for: ${name}`);
    return factory() as T;
  }
}

WorkflowFactory.register('login', () => new LoginWorkflow());
