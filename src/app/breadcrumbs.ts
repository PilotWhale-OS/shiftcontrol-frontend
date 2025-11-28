export class Breadcrumb {
  private _id;

  public get parent() { return this._parent; }
  public get name() { return this._name; }
  public get href() { return this._href; }
  public get id() { return this._id; }

  constructor(private _name: string, private readonly _href: string, private readonly _parent?: Breadcrumb) {
    this._id = Symbol(_name);
  }

  public set name(name: string) {
    this._name = name;
  }

  public getPath(): Breadcrumb[] {
    const path: Breadcrumb[] = [];
    let current: Breadcrumb | undefined = this;
    while (current) {
      path.unshift(current);
      current = current.parent;
    }

    return path;
  }

  /**
   * Clone this breadcrumb while preserving the id
   * @private
   */
  public clone(): Breadcrumb {
    const clone = new Breadcrumb(this._name, this._href, this._parent ? this._parent.clone() : undefined);
    clone._id = this._id;
    return clone;
  }
}


export const BC_EVENTS = new Breadcrumb("Events", "events");
export const BC_SHIFTS = new Breadcrumb("Shifts", "shifts", BC_EVENTS);
