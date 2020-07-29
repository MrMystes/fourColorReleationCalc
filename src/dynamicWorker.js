/**
 * DynamicWorker class
 */
function guid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}
class DynamicWorker {
  constructor(worker) {
    this.uuid = guid();
    // 转换计算方法声明
    const formatFn = `const formatFn = ${worker.toString()};`;
    
    /**
     * 内部 onmessage 处理
     */
    const onMessageHandlerFn = `self.onmessage = ({ data: { data, flag, coverage } }) => {
      console.log('Message received from main script');
      if (data) {
        const result = formatFn(typeof data === 'string' ? JSON.parse(data) : data)
        self.postMessage({
          data: result,
          flag
        });
      }

      console.log('Posting message back to main script');
    }`;

    /**
     * 返回结果
     * @param {*} param0 
     */
    const handleResult = ({ data: { data, flag } }) => {
      const resolve = this.flagMapping[flag];
      
      if (resolve) {
        resolve(data);
        delete this.flagMapping[flag];
      }
    }
    
    const blob = new Blob([`(()=>{${formatFn}${onMessageHandlerFn}})()`]);
    this.worker = new Worker(URL.createObjectURL(blob));
    this.worker.addEventListener('message', handleResult);

    this.flagMapping = {};
    URL.revokeObjectURL(blob);
  }

  /**
   * 动态调用
   */
  send(data) {
    const w = this.worker;
    const flag = new Date().toString();
    w.postMessage({
      data: JSON.stringify(data),
      flag
    });

    return new Promise((res) => {
      this.flagMapping[flag] = res;
    })
  }

  close() {
    this.worker.terminate();
  }
}

export default DynamicWorker;