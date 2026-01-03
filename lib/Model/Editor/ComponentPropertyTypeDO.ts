interface ComponentPropertTypeDO {
  id: string;
  name: string;
  visiable:boolean;
  readonly:boolean;
  isisrequired:boolean;
  defaultValue: any;
  description: string;
  inputType: string; // input  textarea  select
  type: string; // string  boolean  number  option
  options?: string[]; // 当type为option时有效
  direction?: number; // 当inputType为textarea时有效，表示文本域方向
}

export default ComponentPropertTypeDO;