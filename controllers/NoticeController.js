/**
 * @Filename: NoticeController.js
 * @Author: 구나래 (nrggrnngg@gmail.com)
 * @Description: Notice 요청과 응답을 처리하기 위한 컨트롤러
 */
import express from "express";
import regexHelper from "../helper/RegexHelper.js";
import {pagenation} from "../helper/UtilHelper.js";
import NoticeService from "../services/NoticeService.js";

const NoticeController = () => {
    const url = '/Notice';
    const router = express.Router();

    /** 전체 목록 조회 --> Read(SELECT) */
    router.get(url, async (req, res, next) => {
        // 검색어 파라미터
        const query = req.get('query');
        // 페이지 번호 파라미터 (기본값 1)
        const page = req.get('page', 1);
        // 한 페이지에 출력될 데이터 개수 받기 (기본값 10)
        const rows = req.get('rows', 10);

        // 검색어가 있다면 json으로 구성
        const params = {};
        if (query) {
            params.name = query;
        }

        // 데이터 조회
        let json = null;
        let pageInfo = null;

        try {
            // 전체 데이터 수 얻기
            const totalCount = await NoticeService.getCount(params);
            pageInfo = pagenation(totalCount, page, rows);

            params.offset = pageInfo.offset;
            params.listCount = pageInfo.listCount;

            json = await NoticeService.getList(params);
        } catch (err) {
            return next(err);
        }

        res.sendResult({ pagenation: pageInfo, item: json });
    });

    /** 단일행 조회 --> Read(SELECT) */
    router.get(`${url}/:notice_no`, async (req, res, next) => {
        // 파라미터 받기
        const notice_no = req.get('notice_no');

        // 파라미터 유효성 검사
        try {
            regexHelper.value(notice_no, '공지사항 번호를 입력하세요.');
            regexHelper.num(notice_no, '공지사항 번호는 숫자만 입력 가능합니다.');
        } catch (err) {
            return next(err);
        }

        // 데이터 조회
        let json = null;
        
        try {
            json = await NoticeService.getItem({
                notice_no: notice_no
            });
        } catch (err) {
            return next(err);
        }

        res.sendResult({ item: json });
    });

    /** 데이터 생성 --> Create(INSERT) */
    router.post(url, async (req, res, next) => {
        // 파라미터 받기
        const title = req.post('title');
        const content = req.post('content');
        const reg_date = req.post('reg_date');
        const edit_date = req.post('edit_date');

        // 파라미터 유효성 검사
        try {
            regexHelper.value(title, '제목을 입력하세요.');
            regexHelper.value(content, '내용을 입력하세요.');
            regexHelper.value(reg_date, '작성일시를 입력하세요.');
        } catch (err) {
            return next(err);
        }

        // 데이터 저장
        let json = null;
        
        try {
            json = await NoticeService.addItem({
                title: title,
                content: content,
                reg_date: reg_date,
                edit_date: edit_date,
            });
        } catch (err) {
            return next(err);
        }

        res.sendResult({ item: json });
    });

    /** 데이터 수정 --> Update(UPDATE) */
    router.put(`${url}/:notice_no`, async (req, res, next) => {
        // 파라미터 받기
        const notice_no = req.get('notice_no');
        const title = req.put('title');
        const content = req.put('content');
        const reg_date = req.put('reg_date');
        const edit_date = req.put('edit_date');

        // 파라미터 유효성 검사
        try {
            regexHelper.value(notice_no, '공지사항 번호를 입력하세요.');
            regexHelper.num(notice_no, '공지사항 번호는 숫자만 입력 가능합니다.');
            regexHelper.value(title, '제목을 입력하세요.');
            regexHelper.value(content, '내용을 입력하세요.');
            regexHelper.value(reg_date, '작성일시를 입력하세요.');
        } catch (err) {
            return next(err);
        }

        // 데이터 수정
        let json = null;
        
        try {
            json = await NoticeService.editItem({
                notice_no: notice_no,
                title: title,
                content: content,
                reg_date: reg_date,
                edit_date: edit_date
            });
        } catch (err) {
            return next(err);
        }

        res.sendResult({ item: json });
    });

    /** 데이터 삭제 --> Delete(DELETE) */
    router.delete(`${url}/:notice_no`, async (req, res, next) => {
        // 파라미터 받기
        const notice_no = req.get('notice_no');

        // 파라미터 유효성 검사
        try {
            regexHelper.value(notice_no, '공지사항 번호를 입력하세요.');
            regexHelper.num(notice_no, '공지사항 번호는 숫자만 입력 가능합니다.');
        } catch (err) {
            return next(err);
        }
        
        try {
            await NoticeService.deleteItem({
                notice_no: notice_no
            });
        } catch (err) {
            return next(err);
        }

        res.sendResult();
    });
    
    return router;
};

export default NoticeController;