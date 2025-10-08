interface NodeDO {
    id: string;
    isLeaf:boolean;
    originName: string;
    componentType: string;
    children: NodeDO[]|null|undefined;
    describe: string;
}   

export default NodeDO;