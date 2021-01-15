/*
使用scratch ui连接， 派生自thingDemo

测试插件，方便做各种测试

todo 重置积木
    关闭 adapter 插件，清理UI
    清理get的一堆东西，使用下拉，避免被用户点击 一直查询
*/
const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const formatMessage = require("format-message");
const AdapterBaseClient = require("../scratch3_eim/codelab_adapter_base.js");
const ScratchUIHelper = require("../scratch3_eim/scratch_ui_helper.js");

const blockIconURI = require("./icon.svg");
const menuIconURI = blockIconURI;
/**
 * Enum for button parameter values.
 * @readonly
 * @enum {string}
 */

const NODE_NAME = "node_thingDemo";
const NODE_ID = `eim/${NODE_NAME}`;
const HELP_URL = "https://adapter.codelab.club/extension_guide/thingDemo/";

// 翻译
const FormHelp = {
    en: "help",
    "zh-cn": "帮助",
};

// Thing 对象内部可能出现意外错误，重置积木（client/Scratch）（重启整个插件）
const FormReset = {
    en: "reset",
    "zh-cn": "重置",
};

const FormSetEmitTimeout = {
    en: "set wait timeout [emit_timeout]s",
    "zh-cn": "设置等待超时时间[emit_timeout]秒",
};

const FormTakeOff = {
    en: "takeoff",
    "zh-cn": "起飞",
};

const FormLand = {
    en: "land",
    "zh-cn": "降落",
};

const Form_sendTopicMessageAndWait = {
    en: "broadcast [content] and wait",
    "zh-cn": "广播[content]并等待",
  }
  
  const Form_sendTopicMessageAndWait_REPORTER = {
    en: "broadcast [content] and wait",
    "zh-cn": "广播[content]并等待",
  }


class AdapterClient {
    onAdapterPluginMessage(msg) {
        this.node_id = msg.message.payload.node_id;
        if (this.node_id === this.NODE_ID) {
            // json 数据, class

            this.adapter_node_content_hat = msg.message.payload.content;
            this.adapter_node_content_reporter = msg.message.payload.content;
            console.log("content ->", msg.message.payload.content);
        }
    }

    notify_callback(msg) {
        // 使用通知机制直到自己退出
        // todo 重置
        if (msg.message === `${this.NODE_ID} stopped`) {
            this.ScratchUIHelper.reset();
        }
    }

    constructor(node_id, help_url, runtime) {
        this.NODE_ID = node_id;
        this.HELP_URL = help_url;

        this.emit_timeout = 5000; //ms

        this.adapter_base_client = new AdapterBaseClient(
            null, // onConnect,
            null, // onDisconnect,
            null, // onMessage,
            this.onAdapterPluginMessage.bind(this), // onAdapterPluginMessage,
            null, // update_nodes_status,
            null, // node_statu_change_callback,
            this.notify_callback.bind(this),
            null, // error_message_callback,
            null // update_adapter_status
        );
        let list_timeout = 10000;
        // 生成 UI 类
        this.ScratchUIHelper = new ScratchUIHelper(
            "robomasterep2",
            NODE_NAME,
            NODE_ID,
            runtime,
            this.adapter_base_client,
            list_timeout
        );
    }

    emit_with_messageid(NODE_ID, content) {
        return this.adapter_base_client.emit_with_messageid(
            NODE_ID,
            content,
            this.emit_timeout
        );
    }
}

class Scratch3ThingDemoBlocks {
    constructor(runtime) {
        this._runtime = runtime;
        this._runtime.registerPeripheralExtension("thingDemo", this);
        this.client = new AdapterClient(NODE_ID, HELP_URL, runtime);
    }

    //以下都是复制张贴 应该使用一个类来做

    scan() {
        return this.client.ScratchUIHelper.scan();
    }
    connect(id) {
        return this.client.ScratchUIHelper.connect(id);
    }
    disconnect() {
        return this.client.ScratchUIHelper.disconnect();
    }
    reset() {
        return this.client.ScratchUIHelper.reset();
    }
    isConnected() {
        return this.client.ScratchUIHelper.isConnected();
    }

    /**
     * The key to load & store a target's test-related state.
     * @type {string}
     */
    static get STATE_KEY() {
        return "Scratch.thingDemo";
    }


    _setLocale() {
        let now_locale = "";
        switch (formatMessage.setup().locale) {
            case "en":
                now_locale = "en";
                break;
            case "zh-cn":
                now_locale = "zh-cn";
                break;
            default:
                now_locale = "zh-cn";
                break;
        }
        return now_locale;
    }
    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        let the_locale = this._setLocale();
        return {
            id: "thingDemo",
            name: "Thing Demo",
            colour: "#ff641d",
            colourSecondary: "#c94f18",
            colourTertiary: "#c94f18",
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: "open_help_url",
                    blockType: BlockType.COMMAND,
                    text: FormHelp[the_locale],
                    arguments: {},
                },
                {
                    opcode: "control_node",
                    blockType: BlockType.COMMAND,
                    text: FormReset[the_locale],
                },
                {
                    opcode: "set_emit_timeout",
                    blockType: BlockType.COMMAND,
                    text: FormSetEmitTimeout[the_locale],
                    arguments: {
                        emit_timeout: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5.0,
                        },
                    },
                },
                {
                    opcode: "takeoff",
                    blockType: BlockType.COMMAND,
                    text: FormTakeOff[the_locale],
                },
                {
                    opcode: "land",
                    blockType: BlockType.COMMAND,
                    text: FormLand[the_locale],
                },
                {
                    opcode: "broadcastTopicMessageAndWait",
                    blockType: BlockType.COMMAND,
                    text: Form_sendTopicMessageAndWait[the_locale],
                    arguments: {
                        content: {
                            type: ArgumentType.STRING,
                            defaultValue: "thing.move_forward(20)",
                        },
                    },
                },
                {
                  opcode: "broadcastTopicMessageAndWait_REPORTER",
                  blockType: BlockType.REPORTER,
                  text: Form_sendTopicMessageAndWait_REPORTER[the_locale],
                  arguments: {
                      content: {
                          type: ArgumentType.STRING,
                          defaultValue: "thing.query_height()",
                      },
                  },
                },
            ],
            menus: {
                turn: {
                    acceptReporters: true,
                    items: ["start", "stop"],
                },

            },
        };
    }

    takeoff(args, util) {
        const content = "thing.takeoff()";
        return this.client.emit_with_messageid(NODE_ID, content);
    }

    land(args, util) {
        const content = "thing.land()";
        return this.client.emit_with_messageid(NODE_ID, content);
    }

    open_help_url(args) {
        window.open(HELP_URL);
    }

    set_emit_timeout(args) {
        const timeout = parseFloat(args.emit_timeout) * 1000;
        this.client.emit_timeout = timeout;
    }

    broadcastTopicMessageAndWait(args) {
        // topic服务于消息功能， node_id承载业务逻辑(extension)
        const content = args.content;
        return this.client.emit_with_messageid(NODE_ID, content);
    }

    broadcastTopicMessageAndWait_REPORTER(args) {
        // topic服务于消息功能， node_id承载业务逻辑(extension)
        const content = args.content;
        return this.client.emit_with_messageid(NODE_ID, content);
    }

    control_node(args) {
        // ui是由结束通知完成的
        const content = "stop";
        const node_name = NODE_NAME;
        return this.client.adapter_base_client.emit_with_messageid_for_control(
            NODE_ID,
            content,
            node_name,
            "node"
        );
    }
}

module.exports = Scratch3ThingDemoBlocks;
