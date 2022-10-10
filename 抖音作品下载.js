// ==UserScript==
// @name         抖音视频下载
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  打开评论区  按下箭头即可下载当前视频 视频名字为发布日期（可能不是）
// @author       亚心少力
// @match        *://www.douyin.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyin.com
// @grant        none

// ==/UserScript==


(function () {
  // 是否继续下载下个作品 
  let loadcontinue = false  // 持续下载 默认为false  按下i打开/关闭持续下载功能
  let loadtime = 3000  // 加载时间 根据网速调 网卡调大点 单位为毫秒 不然时间获取为null


  const openVideo = () => {
    console.log('开始执行');

    // 获取视频容器
    const getsliderVideo = () => {
      const sliderVideo = document.querySelector('.swiper-slide-active')?.querySelector('.slider-video') || document.querySelector('.slider-video')

      return sliderVideo
    }

    // 获取视频src
    const getSrc = () => {
      const src = getsliderVideo().querySelector('video').querySelector('source').src

      return src
    }

    // 获取时间  （热评发送时间）
    const getTime = () => {
      const comment = document.querySelector('.swiper-slide-active')?.querySelector('.comment-mainContent') || document.querySelector('.comment-mainContent')


      let time = comment?.querySelector('p')?.innerText || null

      let time1 = getsliderVideo().querySelector('.video-create-time').innerText

      if (time1.indexOf('月') != -1)
        time = time1

      return time
    }



    // 打开评论区
    const openComment = () => {
      getsliderVideo().querySelectorAll('.NRiH5zYV')[4].querySelector('div').click()
    }

    // 获取视频描述
    const getVideoDesc = () => {
      const desc = getsliderVideo().querySelector('.video-info-detail').querySelector('.title').innerText

      return desc
    }

    //判断是否为图文
    const isImg = () => {
      const isimg = getsliderVideo().querySelector('.video-info-detail').querySelector('.account').querySelector('.account-card').innerHTML.length != 0

      return isimg
    }



    //下载下一个作品 downloadNext
    const downloadNext = () => {
      getsliderVideo().querySelector('.xgplayer-playswitch-next').click()
      // 模拟下载下个作品的事件
      const ke = new KeyboardEvent('keydown', {
        bubbles: true, cancelable: true,
        key: 'ArrowDown'
      });

      document.body.dispatchEvent(ke);

    }


    // 下载
    const downloadVideo = () => {

      //如果是图文 不继续执行
      if (isImg()) {
        if (loadcontinue) {
          downloadNext()
          return console.log('是图文，下一个');
        } else {
          return console.log('是图文并没开持续下载，下载停止');
        }
      }

      const xhr = new XMLHttpRequest();

      xhr.open('GET', getSrc(), true);
      xhr.responseType = 'blob';

      xhr.onload = function () {
        if (this.status === 200) {
          const fileName = getTime() + getVideoDesc() + '.mp4';
          const blob = new Blob([this.response]);
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(blobUrl);
        }
      };


      xhr.onreadystatechange = () => {
        if (xhr.status === 200 && xhr.readyState == 4) {
          console.log('下载完成' + getTime());

          // 如果继续下载
          if (loadcontinue) {
            // 要等待onload执行玩再下一个 不然获取不到日期
            setTimeout(downloadNext, 500)
          }
        }
      }
      xhr.send();
    }

    // 主函数


    setTimeout(() => {
      // 如果800ms后获取不到评论区时间
      if (!getTime()) {
        openComment() //打开评论区
      }
    }, 800)



    //等各个dom资源加载完成
    setTimeout(downloadVideo, loadtime)

  }

  window.onkeydown = (event) => {
    //按下u下载视频
    if (event.key === 'u') {
      openVideo()
    }

    // 按下i 打开或关闭继续下载
    if (event.key === 'i') {
      loadcontinue = !loadcontinue
      if (loadcontinue) {
        console.log('打开持续下载 请确认你在个人作品列表 否则不会继续下载')
      } else {
        console.log('关闭持续下载')
      }
    }

    if (event.key === 'ArrowDown') {
      openVideo()
    }
  }


})()