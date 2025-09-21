//import { create } from 'zustand';

//interface CounterState {
//count: number;
  //increment: () => void;
  //decrement: () => void;
//}

export class StoreService {
    private static instance: StoreService;
    private data: any;
    private constructor() {
     //   this.data = create<CounterState>((set) => ({
     //       count: 0,
            //increment: () => set((state) => ({ count: state.count + 1 })),
            //decrement: () => set((state) => ({ count: state.count - 1 })),
     //    }));
    }
     
    // 静态公共方法，用于获取唯一的实例
    public static getInstance(): StoreService {
    // 检查实例是否已经存在，如果不存在则创建
    if (!StoreService.instance) {
        StoreService.instance = new StoreService();
    }
    return StoreService.instance;
    }

    public getStore(){
        return this.data;
    }

   

}