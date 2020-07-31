var dragStore = {
    //开始拖拽标志
    isDrag: false,
    //允许放置标志
    dragAble: false,
    //鼠标拖拽位置
    clickState: {
        clientX: 0,
        clientY: 0,
        scrollTop: 0,
    },
    direct: 1,
    
    //拖拽虚拟元素属性
    dragItem:{
        offsetTop: 0,
        offsetLeft: 0,
        scrollWidth: 0,

        customProperty: null,
        indent: 15,
    },
    //拖拽源项
    sourceItem:{
        offsetTop: 0,
        offsetLeft: 0,
        scrollWidth: 0,

        item:null,
        list:[]
    },
    //拖拽目标项
    targetItem:{
        item: null,
        list: []
    },

    //启动计时器
    dragStartTimer: {
        timer: null,
        sec: 1000,
    },
    //允许拖拽计时器
    dragTimer: {
        timer: null,
        sec: 500,
    },

    //绑定源项目
    bindSourceItem: function(e, props){
        if(this.dragStartTimer.timer){
            clearTimeout(this.dragStartTimer.timer);
        }

        let scrollTop = this.clickState.scrollTop;
        let odiv = e.currentTarget;

        //绑定源项
        this.sourceItem.item = props.sourceItem;
        this.sourceItem.list = props.sourceList;
        this.sourceItem.offsetTop = odiv.offsetTop;
        this.sourceItem.offsetLeft = odiv.offsetLeft;
        this.sourceItem.scrollWidth = odiv.scrollWidth;
        //记录鼠标点击位置
        this.clickState.clientY = e.clientY;
        this.clickState.clientX = e.clientX;
        
        this.dragItem.indent = props.indentLeft;

        this.dragStartTimer.timer = setTimeout(()=>{
            this.isDrag = true;

            this.dragItem.offsetTop = this.sourceItem.offsetTop - scrollTop;
            this.dragItem.offsetLeft = this.sourceItem.offsetLeft;
            this.dragItem.scrollWidth = this.sourceItem.scrollWidth;

            document.onmousemove = (e)=>{ 
                //处理拖拽
                this.dragItem.offsetTop = this.sourceItem.offsetTop - scrollTop + (e.clientY - this.clickState.clientY);
                this.dragItem.offsetLeft = this.sourceItem.offsetLeft + (e.clientX - this.clickState.clientX);
            
                if(this.dragItem.offsetTop > this.sourceItem.offsetTop){
                    this.direct = -1;
                }else{
                    this.direct = 1;
                }
            }
            document.onmouseup = (e)=>{
                this.dragAble = false;
                this.targetItem.item = null;
                this.targetItem.list = [];
                this.sourceItem.item = null;
                this.sourceItem.list = [];
                this.sourceItem.offsetTop = 0;
                this.sourceItem.offsetLeft = 0;
                this.sourceItem.scrollWidth = 0;
                //记录鼠标点击位置
                this.clickState.clientY = e.clientY;
                this.clickState.clientX = e.clientX;
                this.isDrag = false;
                document.onmousemove = null;
                clearTimeout(this.dragStartTimer.timer);
                clearTimeout(this.dragTimer.timer);
            }
        }, this.dragStartTimer.sec);
    },

    //绑定目标项目
    bindTargetItem: function(e, props){
        //本身不可拖拽至本身的子节点中
        if(!this.isDrag || this.sourceItem.item.id == props.targetItem.id 
            || props.targetItem.parentId == this.sourceItem.item.id){
            return;
        }
        clearTimeout(this.dragTimer.timer);
        if(this.targetItem.item && this.targetItem.item.id != props.targetItem.id){
            this.dragAble = false;
        }
        
        //绑定目标项
        this.targetItem.item = props.targetItem;
        this.targetItem.list = props.targetList;

        this.dragTimer.timer = setTimeout(()=>{
            this.dragAble = true;
            props.onAfterBindTargetItem(e, this);
        }, this.dragTimer.sec);
    },

    unBindTargetItem: function(e, props){
        clearTimeout(this.dragTimer.timer);
        this.dragAble = false;
        props.onAfterUnBindTargetItem(e, this);
    },

    triggerDragEvent: function(e, props){
        let sourceItem = this.sourceItem.item;
        let sourceList = this.sourceItem.list;
        let targetItem = this.targetItem.item;
        let targetList = this.targetItem.list;

        if(sourceItem && sourceList && targetItem && targetList){
            if(targetItem.id != sourceItem.id && this.dragAble){
                //获取目标项order
                let targetOrder = 0;
                for(var index in targetList){
                    if(targetList[index].id == targetItem.id){
                        targetOrder = targetList[index].order;
                        break;
                    }
                }
    
                //获取源项
                let sourceOrder = 0;
                let moveItem = null;
                for(var index in sourceList){
                    if(sourceList[index].id == sourceItem.id){
                        sourceOrder = index;
                        moveItem = sourceList[index];
                        break;
                    }
                }
                
                moveItem.order = targetOrder - 0.5;

                if(this.direct == -1){
                    moveItem.order = targetOrder + 0.5;
                }
    
                //判断是否拖拽到其他父亲节点下
                if(targetItem.parentId != sourceItem.parentId){
                    //删除旧的节点
                    sourceList = sourceList.splice(sourceOrder, 1);
                    sourceItem.parentId = targetItem.parentId;
                    //移动至目标列表下
                    targetList.push(moveItem);
                }
            }
        }

        this.dragAble = false;
        this.targetItem.item = null;
        this.targetItem.list = [];
        this.isDrag = false;
        document.onmousemove = null;
        clearTimeout(this.dragStartTimer.timer);
        clearTimeout(this.dragTimer.timer);

        props.onAfterDrag(e, this);
    },
};

Vue.directive('drag', {
    // 当被绑定的元素插入到 DOM 中时……
    inserted: function (el, binding, vnode) {
        el.addEventListener('mousedown', function(e){
            let sourceItem = vnode.context.dragUpdateDragStore();
            dragStore.bindSourceItem(e, sourceItem);
        });
        el.addEventListener('mouseover', function(e){
            e.stopPropagation();
            let targetItem = vnode.context.dragUpdateDragStore();
            dragStore.bindTargetItem(e, targetItem);
        });
        el.addEventListener('mouseleave', function(e){
            e.stopPropagation();
            let targetItem = vnode.context.dragUpdateDragStore();
            dragStore.unBindTargetItem(e, targetItem);
        });
        el.addEventListener('mouseup', function(e){
            e.stopPropagation();
            let targetItem = vnode.context.dragUpdateDragStore();
            dragStore.triggerDragEvent(e, targetItem);
        });
    }
});

Vue.component('drag-item', {
    template: ` <div class="dragItem" :style="style">
                    <slot></slot>
                </div>`,
    data: function(){
        return {
            ds: dragStore,
            dragItem: dragStore.dragItem, 
        };
    },
    computed:{
        style: function(){
            return {
                position: 'absolute',
                minHeight: '50px',
                top: this.dragItem.offsetTop,
                left: this.dragItem.offsetLeft,
                width: this.dragItem.scrollWidth,
                backgroundColor: 'rgba(0,0,0,.6)',
                pointerEvents: 'none',
            }
        },
    }
});