var request = require('request')
  , async = require('async')
  , cheerio = require('cheerio')
  , fs    = require("fs")
  , path  = require("path")
  , MongoClient = require('mongodb').MongoClient
  , scope = {page:1, tag:'css3', pens:[]}

;(function start(){
  createFolder('./pen')
  connect()
}())

function connect(cb){
  MongoClient.connect('mongodb://127.0.0.1:27017/codepen', function(err, db) {
    scope.db = db
    getContent(2715)
    // async.parallel([
    //     function(cb){getContent(1)}
    //   , function(cb){getContent(2)}
    //   , function(cb){getContent(3)}
    //   , function(cb){getContent(4)}
    // ], function() {
    //   console.log(arguments)
    // })
  })
}

function getContent(page){
  if(page){
    scope.page = page
  }
  console.log('PAGE -> '+scope.page)

  scope.folder = './pen/'+scope.tag

  createFolder(scope.folder)

  var link = 'http://codepen.io/home/next/tag?page='+scope.page+'&selected_tag='+scope.tag
    , html = ''
  request(link, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      html = JSON.parse(body).html
      if(html.length>2000){
        scope.page++
        getContent()
        return parse(html)
      }
      console.log('END')
      return false
    }
  })
}

function parse(html){
  var $ = cheerio.load(html)
    , singlePen = $('.single-pen')
    , pens = []

  singlePen.each(function(i, e) {
    var link = $(e).find('.cover-link').attr('href')
      , arr = link.split('/')
      , linkIframe = 'http://s.codepen.io/'+arr[3]+'/fullcpgrid/'+arr[5]

    saveFile(linkIframe, arr[5])

    pens.push({
        link: link
      , author: arr[3]
      , linkIframe: linkIframe
      , hash: arr[5]
      , html: ''
      , views: parseInt($(e).find('.single-stat.views').text())
      , like: parseInt($(e).find('.single-stat.loves').text()) || 0
      , tag: scope.tag
    })

    if(singlePen.length === pens.length){
      save(pens, scope.page)
    }

  })
}

// function getIframeContent(url, cb){
//   request(url, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//       cb(body)
//     }
//   })
// }

function save(pens, page){
  var collection = scope.db.collection('pens')
  collection.insert(pens, function(err, pens) {
    console.log('success page -> '+(page-1))
  })
}

function saveFile(url, hash) {
  request(url).pipe(fs.createWriteStream(scope.folder+'/'+hash+'.html'))
}


function createFolder(p) {
  p = path.resolve(p)
  if(!fs.existsSync(p)){
    try{
      fs.mkdirSync(p)
      return true
    } catch(e){
      return false
    }
  }else return true
}


// scope.tags = ['css3', 'animation', 'canvas', 'responsive', '3d', 'slider', 'menu', 'html', 'physics', 'transition', 'ui', 'flat', 'hover', 'navigation', 'transform', 'form', 'svg', 'pure css', 'button', 'loader', 'loading', 'nav', 'dribbble', 'typography', 'bootstrap', 'magnific-popup', 'cloth', 'input', 'modal', 'particles', 'checkbox', 'image', 'slideshow', 'text', 'masonry', 'blur', 'angularjs', 'dropdown', 'grid', 'logo', 'ios', 'shadow', 'box-shadow', 'apple', 'masonry-docs', 'rwd', 'icon', 'scroll', 'twitter', 'background', 'gradient', 'mobile', 'game', 'parallax', 'design', 'social', 'login', 'effect', 'lightbox', 'd3js', 'layout', 'transitions', 'color', 'css only', 'animated', 'iphone', 'tabs', 'audio', 'toggle', 'light', 'clock', 'simple', 'accordion', 'gallery', 'webkit', 'icons', 'carousel', 'keyframes', 'images', 'image slider', 'switch', 'chrome', 'flexbox', 'buttons', 'flat design', 'mouse', 'flip', 'slide', 'skew', 'border', 'spinner', 'radio', 'demo', 'list', 'nojs', 'plugin', 'css animation', 'table', 'gsap', 'experiment']