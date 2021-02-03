import * as THREE from "three";
import {
  scene,
  mouse,
  drawPanel,
  raycaster,
  renderer,
  camera,
  removeObj,
  transformControl
} from "./three_Common.js";
export var drawPointArr = []; //存储绘制报警区域顶点类型
export var drawLineArr = []; //存储绘制报警区域线类型
export var drawGraphArr = []; //存储绘制报警区域图形类型
export var alarmPerimeterArr = []; //报警区域对象数组
export var tempAlarmPerimeter = null; //临时周界对象
//创建报警周界
export function AlarmPerimeter(
  name,
  layerNumber,
  layerName,
  points,
  lines,
  graphs
) {
  this.id = alarmPerimeterArr.length + 1; //id
  this.name = name; //名字
  this.layerNumber = layerNumber; //楼层id
  this.layerName = layerName; //楼层名字
  this.points = []; //点集合
  this.lines = []; //线集合
  this.graphs = []; //图形集合
  this.label; //标签(css2D类型)
  this.setPointMetaPosition = function() {
    if (this.points.length > 0) {
      for (const index in this.points) {
        this.points[index].metaPosition = this.points[index].position;
      }
    }
  };
  this.setPointPosition = function() {
    if (this.points.length > 0) {
      for (const index in this.points) {
        console.log(this.points[index].position);
        console.log(this.points[index].metaPosition);
      }
    }
  };
  //设置css2d标签
  this.setLabel = function(label) {
    const x = graphs[0].geometry.boundingSphere.center.x;
    const z = graphs[0].geometry.boundingSphere.center.y;
    this.label = label;
    this.label.position.set(x, graphs[0].position.y, z);
    this.label.element.textContent = name;
    scene.add(this.label);
  };
  //克隆
  if (points.length > 0 && lines.length > 0 && graphs.length > 0) {
    for (const index in points) {
      this.points.push(points[index].clone());
      scene.add(this.points[index]);
    }
    for (const index in lines) {
      this.lines.push(lines[index].clone());
      scene.add(this.lines[index]);
    }
    for (const index in graphs) {
      this.graphs.push(graphs[index].clone());
      scene.add(this.graphs[index]);
    }
  }
}
//根据id获取报警周界
export function getAlarmPerimeter(id) {
  const tempArr = alarmPerimeterArr;
  if (tempArr.length > 0) {
    for (const index in tempArr) {
      if (tempArr[index].id == id) {
        tempAlarmPerimeter = tempArr[index];
        // return tempArr[index];
      }
    }
  }
}
//根据id删除报警周界
export function deleteAlarmPerimeter(id) {
  const tempArr = alarmPerimeterArr;
  if (tempArr.length > 0) {
    for (const index in tempArr) {
      if (tempArr[index].id == id) {
        removeObj(tempArr[index].points);
        removeObj(tempArr[index].lines);
        removeObj(tempArr[index].graphs);
        removeObj(tempArr[index].label);
        tempArr.splice(index, 1);
      }
    }
  }
}
//编辑报警周界
export function editeAlarmPerimeter() {
  const linesArr = tempAlarmPerimeter.lines;
  const pointsArr = tempAlarmPerimeter.points;
  const graphsArr = tempAlarmPerimeter.graphs;
  //编辑线
  if (linesArr.length > 0) {
    for (const index in linesArr) {
      scene.remove(linesArr[index]);
    }
    linesArr.length = 0;
    var geometry = new THREE.Geometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00
    });
    for (const index in pointsArr) {
      geometry.vertices.push(pointsArr[index].position);
    }
    const line = new THREE.LineLoop(geometry, lineMaterial);
    scene.add(line);
    linesArr.push(line);
  }
  //编辑面
  //如果顶点集合大于3就绘制图块
  if (pointsArr.length > 2) {
    //先清空之前图块
    if (graphsArr.length > 0) {
      scene.remove(graphsArr[0]);
      graphsArr.length = 0;
    }
    //二位数组
    const list = [];
    //遍历顶点集合
    for (let i = 0; i < pointsArr.length; i++) {
      list.push(
        new THREE.Vector2(pointsArr[i].position.x, pointsArr[i].position.z)
      );
    }
    const rectShape = new THREE.Shape(list);
    var geometry = new THREE.ShapeGeometry(rectShape);
    const material = new THREE.MeshBasicMaterial({
      //材质对象
      color: 0xdc143c, //三角面颜色
      side: THREE.DoubleSide, //两面可见
      alphaTest: -1
    });
    material.transparent = true; //是否透明
    material.opacity = 0.3; //透明值
    material.depthWrite = false;
    const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    mesh.rotateX(Math.PI / 2); //绕x轴旋转π/2
    scene.add(mesh);
    graphsArr.push(mesh); //添加进数组
    mesh.geometry.computeBoundingSphere();
    mesh.geometry.boundingSphere.center.x;
    mesh.position.y = drawPanel.position.y;
    mesh.renderOrder = 1;
  }
}
//绘制点(sprite)类
export function drawPoint(vec3) {
  const pointTexture = new THREE.TextureLoader().load("/img/111.png");
  const pointMaterial = new THREE.SpriteMaterial({
    map: pointTexture,
    color: 0xffffff
    // depthWrite : true,
  });
  const pointSprite = new THREE.Sprite(pointMaterial);
  pointSprite.scale.set(0.3, 0.3, 0.3);
  pointSprite.renderOrder = 2;
  pointSprite.metaPosition = pointSprite.position;
  drawPointArr.push(pointSprite);
  pointSprite.position.set(vec3.x, (vec3.y += 0.2), vec3.z);
  scene.add(pointSprite);
}
//绘制线类
export function drawLine() {
  if (drawPointArr.length > 1) {
    scene.remove(drawLineArr[0]);
    drawLineArr.length = 0;
    const geometry = new THREE.Geometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00
    });
    for (const index in drawPointArr) {
      geometry.vertices.push(drawPointArr[index].position);
    }
    const line = new THREE.LineLoop(geometry, lineMaterial);
    scene.add(line);
    //存储起来
    drawLineArr.push(line);
  }
}
//绘制面类
export function drawGraph() {
  //如果顶点集合大于3就绘制图块
  if (drawPointArr.length > 2) {
    //先清空之前图块
    if (drawGraphArr.length > 0) {
      scene.remove(drawGraphArr[0]);
      drawGraphArr.length = 0;
    }
    //二位数组
    const list = [];
    //遍历顶点集合
    for (let i = 0; i < drawPointArr.length; i++) {
      list.push(
        new THREE.Vector2(
          drawPointArr[i].position.x,
          drawPointArr[i].position.z
        )
      );
    }
    const rectShape = new THREE.Shape(list);
    const geometry = new THREE.ShapeGeometry(rectShape);
    const material = new THREE.MeshBasicMaterial({
      //材质对象
      color: 0xdc143c, //三角面颜色
      side: THREE.DoubleSide, //两面可见
      alphaTest: -1
    });
    material.transparent = true; //是否透明
    material.opacity = 0.3; //透明值
    material.depthWrite = false;
    const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    mesh.rotateX(Math.PI / 2); //绕x轴旋转π/2
    scene.add(mesh);
    drawGraphArr.push(mesh); //添加进数组
    mesh.geometry.computeBoundingSphere();
    mesh.geometry.boundingSphere.center.x;
    mesh.position.y = drawPanel.position.y;
    mesh.renderOrder = 1;
  }
}
//鼠标双击绘制周界(点,线,面)
export function onMousedbClick_DrawPerimeter(event) {
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(drawPanel);
  if (intersects.length > 0) {
    drawPoint(intersects[0].point);
    drawLine();
    drawGraph();
    // helper.position.set( 0, 0, 0 );
    // helper.lookAt( intersects[ 0 ].face.normal );
    // helper.position.copy( intersects[ 0 ].point );
  }
}
//鼠标单击选择对象显示变换控件
export function onMouseClick_choosePoints(event) {
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(alarmPerimeterArr[0].points);
  if (intersects.length > 0) {
    if (transformControl) {
      transformControl.attach(intersects[0].object);
    }
  }
}
