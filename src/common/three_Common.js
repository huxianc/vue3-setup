import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min.js";
import {
  CSS2DRenderer,
  CSS2DObject
} from "three/examples/jsm/renderers/CSS2DRenderer";

export var scene,
  camera,
  labelRenderer,
  controls,
  stats,
  transformControl,
  renderer;
export var GLTFModelGroups = []; //存储模型Groups集合

//自身相关
export var self = {
  layerNumber: -1, //所属楼层编号
  layerName: "全局展示", //所属楼层名字,
  getLayerNumber: function() {
    return this.layerNumber;
  },
  getLayerName: function() {
    return this.layerName;
  },

  //更改楼层编号同时更改名字
  setLayerNumber: function(val) {
    this.layerNumber = val;
    if (val == -1) {
      this.layerName = "全局展示";
    } else {
      for (const index in deckJsonArr) {
        if (deckJsonArr[index].id == val) {
          this.layerName = deckJsonArr[index].name;
        }
      }
    }
  }
};
//甲板层json
export var deckJsonArr = [
  { id: 1, name: "顶甲板" },
  { id: 2, name: "罗经甲板" },
  { id: 3, name: "驾驶甲板" },
  { id: 4, name: "直升机甲板" },
  { id: 5, name: "艏楼甲板" },
  { id: 6, name: "登艇甲板" },
  { id: 7, name: "登船甲板" },
  { id: 8, name: "主甲板" },
  { id: 9, name: "下甲板" },
  { id: 10, name: "平台甲板" },
  { id: 11, name: "内底上甲板" },
  { id: 12, name: "内底下甲板" }
];

let Axis;
let HemisphereLight;
let AmbientLight;
let LinearToneMapping;
export var mouse = new THREE.Vector2();
export var drawPanel; //平面画板 绘制周界
export var raycaster = new THREE.Raycaster();
let tweenHandle = 0; //tween帧动画句柄
const meshHiddenArr = []; //存储已隐藏的对象
let bIsMouseClick = true; //鼠标是否可点击

//初始化场景
export function initScene() {
  scene = new THREE.Scene();
  // scene.background = new THREE.CubeTextureLoader()
  // 	.setPath('img/HDR/').load(
  // 		[
  // 			'px.jpg',
  // 			'nx.jpg',
  // 			'py.jpg',
  // 			'ny.jpg',
  // 			'pz.jpg',
  // 			'nz.jpg'
  // 		]
  // 	);
  //return scene;
}
//////////////////////////////////////////////////////////////////////初始化相关
//初始化渲染器
export function initRenderer() {
  //开启阴影效果

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); //抗锯齿
  //开启阴影效果
  renderer.context.getShaderInfoLog = () => "";
  renderer.context.getShaderInfoLog = () => "";
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2; // 电脑显示屏的 gammaFactor(伽马)为2.2
  LinearToneMapping = THREE.LinearToneMapping;
  renderer.toneMapping = LinearToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMappingExposure = 1; // 曝光系数
  renderer.physicallyCorrectLights = true;
  const pmremGenerator = new THREE.PMREMGenerator(renderer); // 使用hdr作为背景色
  pmremGenerator.compileEquirectangularShader();
  new RGBELoader()
    .setDataType(THREE.UnsignedByteType)
    .load("/HDR/railway_bridge_02_2k.hdr", function(texture) {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      envMap.isPmremTexture = true;
      pmremGenerator.dispose();
      // 这两个可以分开设置
      scene.environment = envMap; // 给场景添加环境光效果
      scene.background = envMap; // 给场景添加景图
    });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  // document.body.appendChild(renderer.domElement);

  //CSS2D
  // labelRenderer = new CSS2DRenderer();
  // labelRenderer.setSize(window.innerWidth, window.innerHeight);
  // labelRenderer.domElement.style.position = "absolute";
  // labelRenderer.domElement.style.top = 0;
  // labelRenderer.domElement.style.pointerEvents = "none";
  // document.body.appendChild(labelRenderer.domElement);
  return renderer.domElement;
}
//初始化相机
export function initCamera() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    20000
  );
  camera.position.set(60.233, 61.722, 48.306);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;
}
//初始化性能插件 显示fps值
export function initStats() {
  stats = new Stats();
  stats.domElement.style.position = "absolute";
  stats.domElement.style.left = "0px";
  stats.domElement.style.top = "0px";
  document.body.appendChild(stats.domElement);
  //return stats;
}
//初始化坐标轴
export function initAxis() {
  Axis = new THREE.AxesHelper(100);
  scene.add(Axis);
  return Axis;
}
//创建灯光
export function initLight() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 10);
  scene.add(ambientLight);
  const spotLight = new THREE.SpotLight(0xffffff, 100);
  spotLight.castShadow = true;
  const SpotLightHelper = new THREE.SpotLightHelper(spotLight);
  scene.add(SpotLightHelper);

  spotLight.position.set(10, 40, 35);
  spotLight.rotateX(Math.PI / 3.6);
  //设置阴影贴图精度
  spotLight.shadowMapWidth = spotLight.shadowMapHeight = 1024 * 4;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  scene.add(spotLight);
}
//初始化主角控制器
export function initController() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2;
  controls.minPolarAngle = 0.1;
}
//加载模型
export function loadModel() {
  const loader = new GLTFLoader();
  loader.load("/model/test2.gltf", function(gltf) {
    gltf.scene.traverse(function(child) {
      if (child.isMesh) {
        //console.log(child);
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.transparent = true; //可半透明开启
        child.material.depthWrite = true; //深度开启
      }
    });
    scene.add(gltf.scene);
    GLTFModelGroups = gltf.scene.children;
    GLTFModelGroups.sort(function(a, b) {
      if (parseInt(a.name) < parseInt(b.name)) {
        return -1;
      } else if (parseInt(a.name) > parseInt(b.name)) {
        return 1;
      }
      return 0;
    });
    console.log(GLTFModelGroups);
  });
}
//////////////////////////////////////////////////////////////////////基站相关
//初始化Sprite基站
export function createStationIcon(_id, vec3) {
  const spriteTexture = new THREE.TextureLoader().load("../img/Station.png");
  const spriteMaterial = new THREE.SpriteMaterial({
    map: spriteTexture,
    color: 0xffffff
  });
  const stationSprite = new THREE.Sprite(spriteMaterial);
  stationSprite.scale.set(0.5, 0.5, 0.5);
  scene.add(stationSprite);
  stationSprite._id = _id;
  stationSprite._type = "基站";
  stationSprite.position.copy(vec3);
  stationSpriteArr.push(stationSprite);
  stationSprite.renderOrder = 1; //渲染顺序0
  return stationSprite;
}
//////////////////////////////////////////////////////////////////////标签相关
//创建Sprite人物
export function createPersonIcon(vec3, _id, _name) {
  const spriteTexture = new THREE.TextureLoader().load("../img/Person.png");
  const spriteMaterial = new THREE.SpriteMaterial({
    map: spriteTexture,
    color: 0xffffff
  });
  personSprite = new THREE.Sprite(spriteMaterial);
  scene.add(personSprite);
  personSprite.scale.set(1, 1, 1);
  personSprite.position.copy(vec3); //初始化出生坐标位置
  personSprite._id = _id; //id
  personSprite._startGrid = graph.grid[5][2]; //起点
  personSprite._name = _name; //名字
  personSprite._type = "犯人"; //类型
  personSprite._nearPointsArr = []; //最佳路径坐标集合
  personSprite.renderOrder = 1; //渲染顺序1
  personSprite._behavioralState = 0; //行为状态   0:空闲 1:移动
  personSprite._bIsMove = true;
  personSpriteArr.push(personSprite); //添加进集合
}
//创建回放人物
export function createReplayPersonIcon(vec3) {
  const spriteTexture = new THREE.TextureLoader().load(
    "../img/replayPerson.png"
  );
  const spriteMaterial = new THREE.SpriteMaterial({
    map: spriteTexture,
    color: 0xffffff
  });
  replayPersonSprite = new THREE.Sprite(spriteMaterial);
  scene.add(replayPersonSprite);
  replayPersonSprite.scale.set(1, 1, 1);
  replayPersonSprite.position.copy(vec3);
  replayPersonSprite._type = "回放";
  replayPersonSprite._startGrid; //矩阵起点
  replayPersonSprite.renderOrder = 1; //渲染顺序1
  replayPersonSprite._nearPointsArr = []; //路径坐标集合
  replayPersonSprite._bIsMove = true;
}
//人员路径绘制
export function startPathReplay() {
  //获得出生起始点坐标
  const starVec3 = findStationIdToPosition(pathReplayDataGroup[0]).weight
    .position;
  //创建回放人员
  createReplayPersonIcon(starVec3);
  //获得寻路矩阵起点
  replayPersonSprite._start = findStationIdToPosition(pathReplayDataGroup[0]);
  //遍历回放数据并且获得所有最佳路径点位
  for (let i = 0; i < pathReplayDataGroup.length; i++) {
    findNearPoints(replayPersonSprite, pathReplayDataGroup[i]);
  }
  drawPathLine(replayPersonSprite);
  MovetoStation(replayPersonSprite, 0);
  CameraTrack(true, replayPersonSprite);
}
//结束回放
export function stopPathReplay() {
  if (PathLine) {
    scene.remove(PathLine); //删除路径线
    replayPersonSprite._bIsMove = false; //暂停移动(停止movetostation函数)
    scene.remove(replayPersonSprite); //删除回放对象
    replayPersonSprite = null;
    trackPersonObj = null; //锁定对象清空
    PathLine = null;
  }
}
//////////////////////////////////////////////////////////////////////动画相关
//tween动画(改变Sprite大小)
export function tween_changeSize(obj, state) {
  switch (state) {
    case "plus":
      new TWEEN.Tween(obj.scale)
        .to(new THREE.Vector3(1.5, 1.5, 1), 700)
        .easing(TWEEN.Easing.Elastic.Out)
        .onComplete(function() {})
        .start();
      break;
    case "minus":
      new TWEEN.Tween(obj.scale)
        .to(new THREE.Vector3(1.1, 1.1, 1), 700)
        .easing(TWEEN.Easing.Elastic.Out)
        .onComplete(function() {})
        .start();
      break;
  }
}
//tween动画(两点之间平滑移动 控制器+相机)
//controls动画
export function animateControls(obj, currentTarg, newTarg, newCameraPos) {
  requestAnimationFrame_TWEEN(); //执行tween帧动画
  controls.enablePan = false;
  controls.enableRotate = false;
  bIsMouseClick = false; //鼠标点击事件禁用
  let tween;
  const positionVar = {
    x: currentTarg.x,
    y: currentTarg.y,
    z: currentTarg.z
  };
  tween = new TWEEN.Tween(positionVar);
  tween.to(
    {
      x: newTarg.x,
      y: newTarg.y,
      z: newTarg.z
    },
    500
  );
  tween.onUpdate(function() {
    controls.target.x = positionVar.x;
    controls.target.y = positionVar.y;
    controls.target.z = positionVar.z;
  });
  tween.onComplete(function() {
    if (obj != null) {
      //如果点击场景对象
      animateCamera(
        camera.position.clone(),
        intersectObject.object.position.clone()
      );
    } else {
      console.log("执行相机动画");
      //如果点击按钮非场景对象
      animateCamera(camera.position.clone(), newCameraPos);
    }
  });
  tween.easing(TWEEN.Easing.Cubic.InOut);
  tween.start();
}
//camera动画
export function animateCamera(currentCameraPos, newCameraPos) {
  //newCameraPos.y = currentCameraPos.y;
  let tween;
  const positionVar = {
    x: currentCameraPos.x,
    y: currentCameraPos.y,
    z: currentCameraPos.z
  };
  tween = new TWEEN.Tween(positionVar);
  tween.to(
    {
      x: newCameraPos.x,
      y: newCameraPos.y,
      z: newCameraPos.z
    },
    1000
  );
  tween.onUpdate(function() {
    if (camera.position.distanceTo(newCameraPos) > 3) {
      camera.position.x = positionVar.x;
      camera.position.z = positionVar.z;
      camera.position.y = positionVar.y;
    }
  });
  tween.onComplete(function() {
    controls.enablePan = true;
    controls.enableRotate = true;
    bIsMouseClick = true;
    cancelAnimationFrame_TWEEN();
  });
  tween.easing(TWEEN.Easing.Cubic.InOut);
  tween.start();
}

export function requestAnimationFrame_TWEEN() {
  TWEEN.update();
  tweenHandle = requestAnimationFrame(requestAnimationFrame_TWEEN);
}
export function cancelAnimationFrame_TWEEN() {
  cancelAnimationFrame(tweenHandle);
}

//锁定追踪+每帧更新坐标点
export function CameraTrack(isTrack, obj) {
  bIsTrack = isTrack;
  trackPersonObj = obj;
  if (bIsTrack) {
    controls.enableRotate = false; //禁止旋转
    controls.enablePan = false; //禁止移动
    bIsMouseClick = false; //禁止鼠标点击
    controls.minPolarAngle = 0;
    UpdataCameraPos();
  }
}
export function UpdataCameraPos() {
  if (bIsTrack && trackPersonObj) {
    const targetCameraPosition = trackPersonObj.position.clone();
    targetCameraPosition.y = camera.position.y;
    controls.target = trackPersonObj.position.clone();
    camera.position.set(
      targetCameraPosition.x,
      targetCameraPosition.y,
      targetCameraPosition.z
    );
    requestAnimationFrame(UpdataCameraPos);
  } else {
    controls.enableRotate = true;
    controls.enablePan = true;
    bIsMouseClick = true;
    controls.minPolarAngle = 0.1;
    window.cancelAnimationFrame(UpdataCameraPos);
  }
}
//////////////////////////////////////////////////////////////////////甲板隐藏相关
//全局展示
export function globalDisplay() {
  //x 60.233 y 61.722 z 48.305
  self.setLayerNumber(-1);
  //显示已隐藏的mesh
  if (meshHiddenArr.length > 0) {
    for (const index in meshHiddenArr) {
      meshHiddenArr[index].material.opacity = 1;
      meshHiddenArr[index].material.depthWrite = true;
    }
  }
  //执行动画
  animateControls(
    null,
    controls.target,
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(60.233, 61.722, 48.305)
  );
}
//甲板层选择功能
export function deckSelect(deckIndex) {
  const tempModelGroups = GLTFModelGroups;
  let tempMesh;
  let tempGroup;
  deckIndex -= 1;
  //1.显示已隐藏的mesh
  if (meshHiddenArr.length > 0) {
    for (const index in meshHiddenArr) {
      meshHiddenArr[index].material.opacity = 1;
      meshHiddenArr[index].material.depthWrite = true;
    }
  }
  //2.清空数组
  meshHiddenArr.length = 0;
  //3.遍历group
  for (let i = 0; i < tempModelGroups.length; i++) {
    if (i < deckIndex) {
      for (let j = 0; j < tempModelGroups[i].children.length; j++) {
        //判断是Mesh或Group类型
        if (tempModelGroups[i].children[j] instanceof THREE.Mesh) {
          tempMesh = tempModelGroups[i].children[j];
          //如果是Mesh类型
          tempMesh.material = tempMesh.material.clone(); //克隆材质
          tempMesh.material.opacity = 0;
          tempMesh.material.depthWrite = false; //深度关闭
          meshHiddenArr.push(tempMesh);
        } else {
          //如果是Group类型
          tempGroup = tempModelGroups[i].children[j];
          for (const index in tempGroup.children) {
            if (tempGroup.children[index] instanceof THREE.Mesh) {
              tempMesh = tempGroup.children[index];
              tempMesh.material = tempMesh.material.clone(); //克隆材质
              tempMesh.material.opacity = 0;
              tempMesh.material.depthWrite = false; //深度关闭
              meshHiddenArr.push(tempMesh);
            }
          }
        }
      }
    }
  }
}
//////////////////////////////////////////////////////////////////////绘制周界相关
//创建平面画板
export function createDrawPanel(index) {
  //根据参数得到GLTFModelGroups数组里面的对应楼层的Y高度
  index -= 1;
  const y = GLTFModelGroups[index].position.y;
  if (drawPanel == undefined) {
    //创建画板
    const geometry = new THREE.PlaneGeometry(130, 50, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    material.opacity = 0;
    material.transparent = true;
    material.depthWrite = false;
    drawPanel = new THREE.Mesh(geometry, material);
    drawPanel.rotateX(-Math.PI / 2);
    drawPanel.position.y = y;
    scene.add(drawPanel);
  } else {
    drawPanel.position.y = y;
  }
}
//////////////////////////////////////////////////////////////////////CSS2D相关
//创建css2d标签
export function CSS2DLabel(name) {
  const div = document.createElement("div");
  div.className = "label";
  div.textContent = name;
  div.style.marginTop = "2.5em";
  div.style.fontSize = "14px";
  div.style.padding = "6px";
  div.style.borderRadius = "5px";
  div.style.background = "rgba(255,255,255,1)";
  const label = new CSS2DObject(div);
  return label;
  // const x = parent.graphs[0].geometry.boundingSphere.center.x;
  // const z = parent.graphs[0].geometry.boundingSphere.center.y;
  // label.position.set(x,parent.graphs[0].position.y,z);
  // parent.label = label;
  // scene.add(parent.label);
}
//销毁场景数组对象(非纯数据)
export function removeObj(arr) {
  //如果是数组
  if (arr instanceof Array) {
    if (arr.length > 0) {
      for (const index in arr) {
        scene.remove(arr[index]);
      }
    }
    arr.length = 0;
  } else {
    scene.remove(arr);
  }
}
//变换控件对象
export function transformControls() {
  // 添加平移控件
  transformControl = new TransformControls(camera, renderer.domElement);

  scene.add(transformControl);
  transformControl.setMode("translate");
  transformControl.addEventListener("dragging-changed", function(event) {
    controls.enabled = !event.value;
  });
  transformControl.addEventListener("mouseDown", function(event) {});
  transformControl.addEventListener("mouseUp", function(event) {});
  //   // 初始化拖拽控件
  //   var dragControls = new DragControls(objects, camera, renderer.domElement);
  //    // 鼠标略过事件
  //    dragControls.addEventListener('hoveron', function (event) {
  //     // 让变换控件对象和选中的对象绑定
  //     console.log('hoveron');
  //     transformControls.attach(event.object);
  // });
  //   // 开始拖拽
  //   dragControls.addEventListener('dragstart', function (event) {
  //       controls.enabled = false;
  //       console.log('dragstart');
  //   });
  //   // 拖拽结束
  //   dragControls.addEventListener('dragend', function (event) {
  //       controls.enabled = true;
  //       console.log('dragend');
  //   });
}

//鼠标点击事件注册
export function registerEventListener(event, func) {
  window.addEventListener(event, func);
}
//鼠标点击事件注销
export function cancelEventListener(event, func) {
  window.removeEventListener(event, func);
}
//事件函数相关
//窗口大小自适应
export function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}
// //鼠标双击绘制周界区域
// export function onMousedbClick_DrawPeriter( event ) {
//   mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
//   mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
//   raycaster.setFromCamera( mouse, camera );

//   var intersects = common.raycaster.intersectObject( drawPanel );

//   if ( intersects.length > 0 ) {
//     drawPoint(intersects[ 0 ].point);
//     drawLine();
//     drawGraph();
//     // helper.position.set( 0, 0, 0 );
//     // helper.lookAt( intersects[ 0 ].face.normal );
//     // helper.position.copy( intersects[ 0 ].point );
//   }
// }
