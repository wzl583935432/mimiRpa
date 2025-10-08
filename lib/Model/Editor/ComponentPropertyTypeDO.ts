interface ComponentPropertTypeDO {
  id: string;
  name: string;
  visiable:boolean;
  readonly:boolean;
  defaultValue: any;
  description: string;
  inputType: string; // input  textarea  select
  type: string; // string  boolean  number  option
  options?: string[]; // 当type为option时有效
}

export default ComponentPropertTypeDO;