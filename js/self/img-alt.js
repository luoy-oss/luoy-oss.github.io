// 自动为缺少alt属性的图片添加alt
document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('img:not([alt])');
  images.forEach(img => {
    // 从图片路径提取文件名作为alt
    const imgPath = img.src;
    const imgName = imgPath.split('/').pop().split('.')[0];
    img.alt = imgName.replace(/-|_/g, ' ');
  });
});