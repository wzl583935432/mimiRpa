import ComponentPropertyDO from "./ComponentPropertyDO";

interface ComponentDO{
    id: string;
    originName: string;
    type: string;
    userDefineName: string;
    propertes: Record<string, ComponentPropertyDO>;
    content: string;
}
export default ComponentDO;
