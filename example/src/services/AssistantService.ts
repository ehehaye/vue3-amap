import { message } from 'ant-design-vue';
import { ERR_DESC_MAP } from '@rthx/vue3-amap';
import { Tip } from '@/model/inputtips';

class AssistantService {
  protected static instance: AssistantService;

  static getInstance(): AssistantService {
    if (!this.instance) {
      this.instance = new AssistantService();
    }
    return this.instance;
  }

  protected constructor() {}

  /**
   * 输入提示
   * @see https://lbs.amap.com/api/webservice/guide/api-advanced/inputtips
   * @param {*} param0
   * @returns
   */
  inputtips(data = {}) {
    return fetch(
      `${import.meta.env.VITE_AMAP_BACKEND}/inputtips?${new URLSearchParams({
        ...data,
      }).toString()}`,
      { method: 'GET' },
    )
      .then((res) => res.json())
      .then((res: { info: string; tips: Tip[] }) => {
        if (res.info === 'OK') return res.tips;
        message.error(ERR_DESC_MAP[res.info]);
        return [];
      });
  }
}

export const assistantService = AssistantService.getInstance();
