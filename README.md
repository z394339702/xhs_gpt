# 小红书_gpt
小红书gpt，根据每一篇笔记回答你的问题，避免每一个点开才发现没有你搜索的内容。

# 使用方法
## 准备
![api](https://github.com/z394339702/xhs_gpt/blob/main/img/1.png)
进去文心一言，创建一个API Key以及Secret Key  
填入wx_api.py文件的对应位置  
chrome插件 <加载已解压的扩展程序> 选择本项目  
## 运行
由于文心一言接口调用会跨域，所以需要写一个简单的后端服务做一次中转。  
python wx_api.py 运行后端服务。  
## 使用
进入小红书网页版，进行搜索  
点击搜索图标旁边的<AI>按钮，即可回答你的问题。  
![run](https://github.com/z394339702/xhs_gpt/blob/main/img/2.gif)


