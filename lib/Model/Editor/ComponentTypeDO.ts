import ComponentPropertyTyoeDO from "./ComponentPropertyTypeDO";

interface ComponentTypeDO{
    id: string;
    originName: string;
    type: string;
    propertes: ComponentPropertyTyoeDO[];

}

export default ComponentTypeDO;