document.getElementById('addBookmarks').addEventListener('click', function() {
    const urls = document.getElementById('urls').value.split('\n').filter(url => url.trim() !== '');
    const folderName = document.getElementById('folderName').value.trim();
  
    if (urls.length === 0) {
      showMessage('Please enter at least one URL.', 'bg-red-500');
      return;
    }
  
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
      const bookmarkBarId = bookmarkTreeNodes[0].children[0].id;
      
      if (folderName) {
        chrome.bookmarks.search({title: folderName}, function(results) {
          if (results.length > 0 && results[0].parentId === bookmarkBarId) {
            addBookmarksToFolder(results[0].id, urls);
          } else {
            chrome.bookmarks.create({parentId: bookmarkBarId, title: folderName}, function(newFolder) {
              addBookmarksToFolder(newFolder.id, urls);
            });
          }
        });
      } else {
        addBookmarksToBookmarkBar(bookmarkBarId, urls);
      }
    });
  });
  
  function addBookmarksToFolder(folderId, urls) {
    addBookmarks(urls, {parentId: folderId});
  }
  
  function addBookmarksToBookmarkBar(bookmarkBarId, urls) {
    addBookmarks(urls, {parentId: bookmarkBarId});
  }
  
  function addBookmarks(urls, bookmarkProps) {
    let addedCount = 0;
    urls.forEach(url => {
      chrome.bookmarks.create({
        ...bookmarkProps,
        title: getWebsiteName(url),
        url: url
      }, function() {
        addedCount++;
        if (addedCount === urls.length) {
          showSuccessAndClose();
        }
      });
    });
  }
  
  function getWebsiteName(url) {
    try {
      const { hostname, pathname } = new URL(url);
      let name = hostname.replace(/^www\./, '');
      if (pathname !== '/' && pathname !== '') {
        name += pathname.replace(/\/$/, '');
      }
      name = name.charAt(0).toUpperCase() + name.slice(1);
      return name;
    } catch (e) {
      return url;
    }
  }
  
  function showSuccessAndClose() {
    showMessage('Bookmarks added successfully!', 'bg-green-500');
    setTimeout(() => {
      window.close();
    }, 2000);
  }
  
  function showMessage(message, bgColor) {
    const messageEl = document.getElementById('successMessage');
    messageEl.textContent = message;
    messageEl.className = `success-message fixed top-0 left-0 right-0 ${bgColor} text-white text-center py-2 shadow-md`;
    messageEl.classList.add('show');
    setTimeout(() => {
      messageEl.classList.remove('show');
    }, 3000);
  }