const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
require('dotenv').config();
const {caesarDecrypt, aesDecrypt} = require('../utils/cryptoUtils');

const MEMBERS_JSON_PATH = path.join(__dirname, '../config/members.json');

const authMiddleware = async (req, res, next) => {
    try {
        let {token} = req.query;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "未授权访问"
            });
        }

        token = decodeURIComponent(token);
        const decryptedAesToken = aesDecrypt(token);
        const finalToken = caesarDecrypt(decryptedAesToken);

        if (finalToken !== process.env.CAESAR_VALID_TOKEN) {
            return res.status(401).json({
                success: false,
                message: "未授权访问"
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "未授权访问",
            error: process.env.NODE_ENV === 'development' ? err.message : ''
        });
    }
};

/**
 * 读取服务器成员 JSON 文件
 * @returns {Array} 校验后的成员列表
 */
async function readMembersFromJson() {
    try {
        const fileContent = await fs.readFile(MEMBERS_JSON_PATH, 'utf8');
        const membersData = JSON.parse(fileContent);

        let members = [];
        if (Array.isArray(membersData)) {
            members = membersData;
        } else if (membersData?.members && Array.isArray(membersData.members)) {
            members = membersData.members;
        } else {
            throw new Error('JSON 文件格式错误：根节点必须是成员对象数组或包含 members 字段');
        }

        const validMembers = members.filter(member => {
            const isObject = typeof member === 'object' && member !== null;
            return isObject && typeof member.name === 'string' && member.name.trim() !== '';
        });

        if (validMembers.length !== members.length) {
            console.warn(`成员校验：过滤了 ${members.length - validMembers.length} 个无效成员`);
        }

        return validMembers;

    } catch (error) {
        console.error('读取成员 JSON 文件失败：', error.message);
        return [];
    }
}

router.get('/members', authMiddleware, async (req, res) => {
    try {
        const members = await readMembersFromJson();

        res.status(200).json({
            success: true,
            count: members.length,
            data: members
        });

    } catch (error) {
        console.error('获取成员列表失败：', error);
        res.status(500).json({
            success: false,
            message: "加载成员列表失败",
            error: process.env.NODE_ENV === 'development' ? error.message : ''
        });
    }
});

router.post('/members', authMiddleware, async (req, res) => {
    try {
        const {members} = req.body;

        if (!Array.isArray(members)) {
            return res.status(400).json({
                success: false,
                message: "成员数据格式错误"
            });
        }

        const validMembers = members.filter(member => {
            const isObject = typeof member === 'object' && member !== null;
            const hasName = isObject && typeof member.name === 'string' && member.name.trim() !== '';
            const hasUuid = isObject && typeof member.uuid === 'string' && member.uuid.trim() !== '';
            return hasName && hasUuid;
        });

        if (validMembers.length !== members.length) {
            console.warn(`成员校验：过滤了 ${members.length - validMembers.length} 个无效成员`);
        }

        await fs.writeFile(MEMBERS_JSON_PATH, JSON.stringify(validMembers, null, 2), 'utf8');

        res.status(200).json({
            success: true,
            message: "成员列表保存成功",
            count: validMembers.length,
            data: validMembers
        });

    } catch (error) {
        console.error('保存成员列表失败：', error);
        res.status(500).json({
            success: false,
            message: "保存成员列表失败",
            error: process.env.NODE_ENV === 'development' ? error.message : ''
        });
    }
});

router.post('/members/add', authMiddleware, async (req, res) => {
    try {
        const {member} = req.body;

        if (!member || typeof member !== 'object') {
            return res.status(400).json({
                success: false,
                message: "成员数据格式错误"
            });
        }

        const {name, uuid} = member;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "成员名称无效"
            });
        }

        if (!uuid || typeof uuid !== 'string' || uuid.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "成员 UUID 无效"
            });
        }

        const members = await readMembersFromJson();

        const existingMember = members.find(m => m.uuid === uuid);
        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: "该 UUID 的成员已存在"
            });
        }

        members.push({
            name: name.trim(),
            uuid: uuid.trim()
        });

        await fs.writeFile(MEMBERS_JSON_PATH, JSON.stringify(members, null, 2), 'utf8');

        res.status(200).json({
            success: true,
            message: "成员添加成功",
            data: members
        });

    } catch (error) {
        console.error('添加成员失败：', error);
        res.status(500).json({
            success: false,
            message: "添加成员失败",
            error: process.env.NODE_ENV === 'development' ? error.message : ''
        });
    }
});

router.delete('/members/:uuid', authMiddleware, async (req, res) => {
    try {
        const {uuid} = req.params;

        if (!uuid || typeof uuid !== 'string' || uuid.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "UUID 参数无效"
            });
        }

        const members = await readMembersFromJson();
        const initialLength = members.length;

        const updatedMembers = members.filter(member => member.uuid !== uuid);

        if (updatedMembers.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: "未找到该成员"
            });
        }

        await fs.writeFile(MEMBERS_JSON_PATH, JSON.stringify(updatedMembers, null, 2), 'utf8');

        res.status(200).json({
            success: true,
            message: "成员删除成功",
            data: updatedMembers
        });

    } catch (error) {
        console.error('删除成员失败：', error);
        res.status(500).json({
            success: false,
            message: "删除成员失败",
            error: process.env.NODE_ENV === 'development' ? error.message : ''
        });
    }
});

module.exports = router;
