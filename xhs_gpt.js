const serverUrl = 'http://127.0.0.1:3000';  // 代理服务器的URL
let access_token = '';  
let userQuestion = '';
let analysis_results = {};
let tasks = [];

function getAccessToken() {
    return new Promise((resolve, reject) => {
        fetch(`${serverUrl}/getAccessToken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.access_token) {
                resolve(data.access_token);
            } else {
                throw new Error('Failed to retrieve access token');
            }
        })
        .catch(error => {
            console.error('Error fetching access token:', error);
            reject(error);
        });
    });
}

// 获取access_token
getAccessToken().then(token => {
    access_token = token;
    console.log('Access token:', access_token);
})

function getPrompt(userMessage) {
    return `
# Role：文章总结专家

## Background：
作为文章总结专家，你的工作不仅是理解文章的内容，还需要根据文章的内容来回答我的问题。

## Constrains:
- 答案必须真实从我提供的文章中抽取
- 避免使用可能引起争议的词汇和表达
- 保持内容的统一和协调
- 如果文章中找不到问题的答案，请回答：“文章中没有相关信息。”
- 回答字数保持在60字左右

## Workflow:
1. 首先，分析文档提到了哪些内容。
2. 然后，根据文章的内容回答我的问题。

## Start:
	${userMessage}
	
	问题：${userQuestion}
	回答：`;
}
 
function getWenxinResponse(prompt) {
    return new Promise((resolve, reject) => {
        fetch(`${serverUrl}/getWenxinResponse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({access_token, prompt })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.result) {
                resolve(data.result);
            } else {
                throw new Error('Failed to retrieve Wenxin response');
            }
        })
        .catch(error => {
            console.error('Error fetching Wenxin response:', error);
            reject(error);
        });
    });
}


function analysisNotes(aTag) {
    return new Promise((resolve, reject) => {
		var url = aTag.href;
        fetch(url, {
            method: 'GET',
            // headers: {
            //     'Content-Type': 'application/json'
            // },
            // body: JSON.stringify({})
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
		.then(html => {  
            // 使用DOMParser解析HTML  
            var parser = new DOMParser();  
            var doc = parser.parseFromString(html, 'text/html');  
  
            // 获取所有的<p>标签并移除  
            var pTags = doc.getElementsByTagName('p');  
            while (pTags.length > 0) {  
                pTags[0].parentNode.removeChild(pTags[0]);  
            }  
  
			const titleTag = doc.querySelector('meta[name="og:title"]'); 
			const titleValue = titleTag.getAttribute('content');  

			const descriptionTag = doc.querySelector('meta[name="description"]'); 
			const descriptionValue = descriptionTag.getAttribute('content');  

			const book_result = '文章标题：' + titleValue + '\n' + '文章内容：' + descriptionValue;
			console.log(book_result);
			const prompt_info = getPrompt(book_result);
			console.log(prompt_info);
            return prompt_info; // 解析后的HTML作为Promise的结果  
        })
		.then(prompt_info => {
		    const wx_result = getWenxinResponse(prompt_info);
		    return wx_result;
		}
		).then(wx_result => {
		    console.log(wx_result);
		    resolve(wx_result);
		})
		// .then(book_result => {  
		// 	console.log(book_result);  
		// 	return new Promise(resolve => {  
		// 		setTimeout(() => {  
		// 			resolve(book_result);  // 在延迟后解决 Promise  
		// 		}, Math.random() * 3000);  
		// 	});  
		// })  
		// .then(book_result =>{
		// 	console.log(book_result);
		// 	resolve(book_result);
		// })
        .catch(error => {
            console.error('Error fetching access token:', error);
            reject(error);
        });
    });
}



// 分析所有笔记
async function analysisAllNotes() {
	// 获取用户搜索内容
    userQuestion =  document.title.split(' - ')[0];

    // 使用 document.querySelectorAll 选择所有具有指定 class 的 a 标签  
	const aTags = document.querySelectorAll('a.cover.ld.mask');  
	
	// 你可以将 NodeList 转换为数组，以便进行更多操作（可选）  
	const aTagsArray = Array.from(aTags);  
	
	for (const aTag of aTagsArray) {  
        try {
			// if (tasks.includes(userQuestion + aTag.href)){
			// 	console.log('已处理:', userQuestion + aTag.href);
			// 	continue;
			// }
			// tasks.append(userQuestion + aTag.href);
			if (analysis_results[userQuestion + aTag.href] == undefined) {
				const result = await analysisNotes(aTag);  

				console.log('处理完成:', result);  
				analysis_results[userQuestion + aTag.href] = result;
				aTag.style.display = "none"; 

				var newDiv = document.createElement('div');  			
				newDiv.textContent = result;  

				var hr1 = document.createElement('hr');  			
				var hr2 = document.createElement('hr');  			

				aTag.parentNode.insertBefore(hr1, aTag);
				aTag.parentNode.insertBefore(newDiv, aTag);
				aTag.parentNode.insertBefore(hr2, aTag);

				// 休息3秒  
				await new Promise(resolve => setTimeout(resolve, 1000));  
			}
			else {
				aTag.style.display = "none"; 

				var newDiv = document.createElement('div');  			
				newDiv.textContent = analysis_results[userQuestion + aTag.href];  

				var hr1 = document.createElement('hr');  			
				var hr2 = document.createElement('hr');  			

				aTag.parentNode.insertBefore(hr1, aTag);
				aTag.parentNode.insertBefore(newDiv, aTag);
				aTag.parentNode.insertBefore(hr2, aTag);
			}
        } catch (error) {  
            console.error('处理 a 标签时出错:', error);  
        }  
    }  

}



// 添加新的button

function addNewButton() {

	const search_button = document.querySelectorAll('div.input-button')[0];  


	// 创建新的 div 元素  
	var newDiv = document.createElement('div');  
	newDiv.setAttribute('data-v-2a7a3de2', '');  
	newDiv.className = 'search-icon';  

	// 创建新的 a 元素  
	var newA = document.createElement('button');  
	newA.setAttribute('onclick', 'analysisAllNotes()');  

	newA.textContent = 'AI';  

	// 将新的 a 元素添加到新的 div 元素中  
	newDiv.appendChild(newA);  

	search_button.appendChild(newDiv);  

}

addNewButton();
