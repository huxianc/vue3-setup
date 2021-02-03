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
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
export var alarmPerimeterArr = []; //报警区域对象数组
export var tempAlarmPerimeter; //临时周界对象
export class AlarmPerimeter {
  constructor(name, layerNumber, layerName, points, lines, graphs) {
    this.id = alarmPerimeterArr.length + 1;
    //名字
    this.name = name;
    //层号
    this.layerNumber = layerNumber;
    //层名
    this.layerName = layerName;
    //点集合(Sprite类型)
    this.points = points;
    //线集合
    this.lines = lines;
    //图块集合
    this.graphs = graphs;
    //css2D label标签
  }
  label = new Object();
  //添加顶点
  addPoint(vec3) {
    const pointTexture = new THREE.TextureLoader().load("/img/111.png");
    const pointMaterial = new THREE.SpriteMaterial({
      map: pointTexture,
      color: 0xffffff
      // depthWrite : true,
    });
    const pointSprite = new THREE.Sprite(pointMaterial);
    pointSprite.scale.set(0.3, 0.3, 0.3);
    pointSprite.renderOrder = 2;
    this.points.push(pointSprite);
    pointSprite.position.set(vec3.x, (vec3.y += 0.2), vec3.z);
    pointSprite.metaPosition = pointSprite.position.clone();
    scene.add(pointSprite);
  }
  //更新顶点坐标
  setPointPosition() {
    for (const index in this.points) {
      this.points[index].metaPosition = this.points[index].position.clone();
    }
  }
  //重置顶点坐标
  resetPointPosition() {
    for (const index in this.points) {
      this.points[index].position = this.points[index].metaPosition.clone();
    }
    this.editeGraph();
  }
  //添加线
  addLine() {
    if (this.points.length > 1) {
      scene.remove(this.lines[0]);
      this.lines.length = 0;
      const geometry = new THREE.Geometry();
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00ff00
      });
      for (const index in this.points) {
        geometry.vertices.push(this.points[index].position);
      }
      const line = new THREE.LineLoop(geometry, lineMaterial);
      scene.add(line);
      //存储起来
      this.lines.push(line);
    }
  }
  //添加图块
  addGraph() {
    //如果顶点集合大于3就绘制图块
    if (this.points.length > 2) {
      //先清空之前图块
      if (this.graphs.length > 0) {
        scene.remove(this.graphs[0]);
        this.graphs.length = 0;
      }
      //二位数组
      const list = [];
      //遍历顶点集合
      for (let i = 0; i < this.points.length; i++) {
        list.push(
          new THREE.Vector2(
            this.points[i].position.x,
            this.points[i].position.z
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
      this.graphs.push(mesh); //添加进数组
      mesh.geometry.computeBoundingSphere();
      mesh.geometry.boundingSphere.center.x;
      mesh.position.y = drawPanel.position.y;
      mesh.renderOrder = 1;
    }
  }
  //添加标签
  addLabel() {
    const div = document.createElement("div");
    div.className = "label";
    div.textContent = this.name;
    div.style.marginTop = "2.5em";
    div.style.fontSize = "14px";
    div.style.padding = "6px";
    div.style.borderRadius = "5px";
    div.style.background = "rgba(255,255,255,0.5)";
    this.label = new CSS2DObject(div);
    this.label.position.set(
      this.graphs[0].geometry.boundingSphere.center.x,
      this.graphs[0].position.y,
      this.graphs[0].geometry.boundingSphere.center.y
    );
    scene.add(this.label);
  }
  //设置标签坐标
  setLabelPos() {
    this.label.position.set(
      this.graphs[0].geometry.boundingSphere.center.x,
      this.graphs[0].position.y,
      this.graphs[0].geometry.boundingSphere.center.y
    );
  }
  setLabelName(name) {
    this.label.element.textContent = name;
  }
  //编辑图块
  editeGraph() {
    const linesArr = this.lines;
    const pointsArr = this.points;
    const graphsArr = this.graphs;
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
}
export function initObject(
  name = "",
  layerNumber = 0,
  layerName = 0,
  points = [],
  lines = [],
  graphs = []
) {
  tempAlarmPerimeter = new AlarmPerimeter(
    name,
    layerNumber,
    layerName,
    points,
    lines,
    graphs
  );
  return tempAlarmPerimeter;
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
//根据id编辑报警周界
export function editeAlarmPerimeter() {
  tempAlarmPerimeter.editeGraph();
}

//鼠标双击绘制周界(点,线,面)
export function onMousedbClick_DrawPerimeter(event) {
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(drawPanel);
  if (intersects.length > 0) {
    tempAlarmPerimeter.addPoint(intersects[0].point);
    tempAlarmPerimeter.addLine();
    tempAlarmPerimeter.addGraph();
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
  const intersects = raycaster.intersectObjects(tempAlarmPerimeter.points);
  if (intersects.length > 0) {
    if (transformControl) {
      transformControl.attach(intersects[0].object);
    }
  }
}
