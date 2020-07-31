Vue.component('guide-tree', {
    template: ` <div class="guideTree" v-on:click.self="setCurrent" onselectstart="return false;">
                    <guide-item v-for="(child, index) in children" :item-id="child.id" :indent-left="indentLeft" :key="child.id"></guide-item>
                </div>`,
    data: function(){
        return {
            ds: store, 
        };
    },
    props: ['itemId', 'indent'],
    computed: {
        children: function(){
            return this.ds.queryChild(this.itemId);
        },
        flexWidth: function(){
            var len = parseInt(this.children.length);
            return 1 / len * 100 + '%';
        },
        indentLeft: function(){
            return this.indent+15;
        }
    },
    methods: {
        setCurrent: function(){
            console.log('in');
            this.ds.setCurrent(this.itemId);
        }
    },
});

Vue.component('guide-item', {
    template: ` <div class="guideItem" :style="style" v-show="this.item.valid=='1'">
                    <div v-drag class="itemName" :style="styleName" @mousedown.stop="setCurrent">
                        <i :style="styleIcon"></i>
                        <a :href="this.item.url" v-if="this.item.type=='1'" target="_blank">{{item.value}}</a>
                        <span :style="styleSpan" v-else>{{item.value}}</span>
                        <img :style="styleFold" v-on:click="expandChild" :src="iconImg" v-if="this.item.type == '0'"/>
                    </div>
                    <guide-tree :item-id="itemId" :indent="this.indentLeft" v-if="expand"></guide-tree>
                </div>`,
    data: function(){
        return {
            expand: false,
            ds: store, 
            style: {
                width: '100%',
                minHeight: '50px',
            },
            styleSpan: {
                flex: '1 1 auto',
            },
            styleFold: {
                flex: '0 1 16px',
                marginRight: '10px',
                width: '16px',
                height: '16px',
            },
            timer: null,
            dragSpace: 0,
        };
    },
    props: ['itemId', 'indentLeft'],
    methods: {
        expandChild: function(){
            if(this.item.type == "0"){
                this.expand = !this.expand;
            }
            this.ds.state.scrollWidth = 0;
        },
        setCurrent: function(){
            this.ds.setCurrent(this.itemId);
        },
        dragUpdateDragStore: function(){
            return {
                sourceItem: this.ds.queryItem(this.ds.state.currentId),
                sourceList: this.ds.queryChild(this.item.parentId),
                targetItem: this.item,
                targetList: this.ds.queryChild(this.item.parentId),

                indentLeft: this.indentLeft,

                onAfterBindTargetItem: (e, ds)=>{
                    this.dragSpace = 50;
                    if(ds.direct == -1){
                        this.dragSpace = -50;
                    }
                },
                onAfterUnBindTargetItem: (e)=>{
                    this.dragSpace = 0;
                },
                onAfterDrag: (e)=>{
                    this.dragSpace = 0;
                    this.setCurrent();
                }
            }
        },
    },
    computed: {
        children: function(){
            return this.ds.queryChild(this.itemId);
        },
        item: function(){
            return this.ds.queryItem(this.itemId);
        },
        icon: function(){
            return (this.expand||this.item.type === "1")?"-":"+"
        },
        iconImg: function(){
            return (this.expand||this.item.type === "1")?"image/fold.png":"image/fold-reverse.png"
        },
        styleIcon: function(){
            var iconUrl = 'url(image/folder-white.png)'
            if(this.item && this.item.type == '1'){
                iconUrl = 'url(image/link-white.png)';
            }

            return {
                flex: '0 1 25px',
                marginRight: '10px',
                backgroundImage: iconUrl,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                width: '25px',
                height: '25px',
            }
        },
        styleName: function(){
            return {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                fontSize: '20px',
                height: '50px',
                paddingLeft: this.indentLeft + 'px',
                paddingTop: (this.dragSpace>0?this.dragSpace:0) + 'px',
                paddingBottom: (this.dragSpace<0?-this.dragSpace:0) + 'px',
            } 
        },
    },
});