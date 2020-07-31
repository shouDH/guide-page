Vue.component('guide-control', {
    template: `<div :style="style" class="guide-control">
                    <div class="buttonGroup" :style="styleButtonGroup">
                        <button :style="styleButton" v-on:click.stop="toggleForm">/</button>
                        <button :style="styleButton" v-on:click.stop="add">+</button>
                        <button :style="styleButton" v-on:click.stop="drop">-</button>
                    </div>
                    <div class="guideContent" :style="styleContent" v-on:click.self="setCurrent">
                        <form class="currentItem" :style="styleForm" v-if="!configForm">
                            <i :style="styleIcon" v-on:click.stop="toggleType"></i>
                            <input :style="styleInput" type="text" v-model="item.value" :placeholder="item.type=='1'?'链接名':'目录名'"/>
                            <div style="position:relative;flex:1 1 auto;height: 100%;top:-4px;">
                                <i :style="styleIP" v-if="item.type=='1'"></i>
                                <input :style="styleInputIP" type="text" v-model="item.url" v-if="item.type=='1'" placeholder="地址"/>
                            </div>
                        </form>
                        <form class="currentItem" :style="styleForm" v-else>
                            <input :style="styleConfig" type="file" ref="inputer" @change="readConfig"/>
                            <i :style="styleImport" v-on:click.stop="importConfig"></i>
                            <i :style="styleExport" v-on:click.stop="exportConfig"></i>
                        </form>
                        <drag-item v-show="drag.isDrag">
                            <div class="itemName" :style="styleName">
                                <span :style="styleSpan">{{value}}</span>
                            </div>
                        </drag-item>
                        <slot></slot>
                    </div>
                </div>`,
    data: function(){
        return {
            ds: store,
            drag: dragStore,
            tempConfig: {},
            configForm: false,
            style: {
                display: 'flex',
                flexDirection: 'row',
                height: '100%',
            },
            styleForm: {
                position: 'relative',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                flex: '0 1 auto',
                height: '45px',
                backgroundColor: 'rgba(32,28,33,.9)',
            },
            styleInput: {
                width: '180px',
                height: '95%',
                margin: '5px',
                paddingLeft: '40px',
                border: 'none',
                fontSize: '16px',
                backgroundColor: 'rgba(242,242,242,.9)'
            },
            styleInputIP: {
                width: '80%',
                height: '95%',
                margin: '5px',
                paddingLeft: '40px',
                border: 'none',
                fontSize: '16px',
                backgroundColor: 'rgba(242,242,242,.9)'
            },
            styleConfig: {
                width: '95%',
                height: '70%',
                margin: '5px',
                paddingLeft: '20px',
                border: 'none',
                fontSize: '16px',
                backgroundColor: 'rgba(242,242,242,.9)'
            },
            styleLabel: {
                margin: '8px',
            },
            styleButtonGroup: {
                display: 'flex',
                flex: '0 1 54px',
                width: '54px',
                height: '100%',
                flexDirection: 'column',
                backgroundColor: 'rgb(0,0,0)',
            },
            styleButton: {
                width: '50px',
                height: '50px',
                margin: '2px',
                border: '0px',
                backgroundColor: 'rgb(0,0,0)',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
            },
            styleImport: {
                width: '30px',
                height: '30px',
                margin: '2px',
                border: '0px',
                backgroundImage: 'url(image/import.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
            },
            styleExport: {
                width: '30px',
                height: '30px',
                margin: '2px',
                border: '0px',
                backgroundImage: 'url(image/export.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
            },
            styleContent: {
                display: 'flex',
                flexDirection: 'column',
                flex: '0 1 34%',
                width: '34%',
                height: '100%',
                backgroundColor: 'rgba(40, 32, 42, .9)',
            },
            styleIP: {
                position: 'absolute',
                left: '10px',
                top: '8px',
                zIndex: '5',
                width: '30px',
                height: '30px',
                backgroundImage: 'url(image/ip.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
            },
            styleSpan: {
                flex: '1 1 auto',
                color: 'rgba(255,255,255,.8)',
            },
        };
    },
    computed: {
        item: function(){
            if(!this.ds.state.currentId){
                this.ds.setCurrent('root');
                return this.ds.queryItem('root');
            }
            return this.ds.queryItem(this.ds.state.currentId);
        },
        id: function(){
            return this.ds.state.currentId;
        },
        styleIcon: function(){
            var iconUrl = 'url(image/folder.png)'
            if(this.item && this.item.type == '1'){
                iconUrl = 'url(image/link.png)';
            }

            return {
                position: 'absolute',
                left: '10px',
                top: '5px',
                zIndex: '5',
                width: '30px',
                height: '30px',
                backgroundImage: iconUrl,
                backgroundSize: 'contain',
            }
        },

        styleName: function(){
            return {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                fontSize: '20px',
                height: '50px',
                paddingLeft: this.drag.dragItem.indent+'px',
            }
        },
        value: function(){
            if(this.drag.sourceItem.item){
                return this.drag.sourceItem.item.value;
            }else{
                return null;
            }
        },
    },
    methods: {
        add: function(){
            this.ds.setCurrent(this.ds.addItem(this.id, "", "1"));
        },
        drop: function(){
            var parentId = this.item.parentId;
            this.ds.deleteItem(this.id);
            this.ds.setCurrent(parentId);
        },
        toggleType: function(){
            var item = this.ds.queryItem(this.ds.state.currentId);
            if(item.type == '0'){
                item.type = '1';
            }else if(item.type == '1'){
                item.type = '0';
            }

            var parent = this.ds.queryItem(item.parentId);

            for(var index in parent.children){
                if(parent.children[index].id == this.ds.state.currentId){
                    parent.children[index].type = item.type;
                }
            }
        },
        toggleForm: function(){
            this.configForm = !this.configForm;
        },
        readConfig: function(){
            var inputDOM = this.$refs.inputer;
            var file = inputDOM.files[0];
            var reader = new FileReader(); 
            reader.readAsText(file);
            var that = this;
            reader.onload = function(){
                try{
                    that.tempConfig = JSON.parse(reader.result);
                }catch(e){
                    console.log(e); 
                }
            }
        },
        importConfig: function(){
            if(this.tempConfig){
                this.ds.state = this.tempConfig;
            }
        },
        exportConfig: function(){
            var eleLink = document.createElement('a');
            eleLink.download = 'config.json';
            eleLink.style.display = 'none';
            var blob = new Blob([JSON.stringify(this.ds.state)]);
            eleLink.href = URL.createObjectURL(blob);
            document.body.appendChild(eleLink);
            eleLink.click();
            document.body.removeChild(eleLink);
        },
        setCurrent: function(){
            this.ds.setCurrent('root');
        }
    },
});