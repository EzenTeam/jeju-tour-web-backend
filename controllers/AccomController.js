import express from 'express';
import regexHelper from '../helper/RegexHelper.js';
import {pagenation} from '../helper/UtilHelper.js';
import accomService from '../services/AccomService.js';

const AccomController = () => {
    const url = "/accom";
    const router = express.Router();

    // 여행지 다중행 조회
    router.get(url, async(req,res,next)=>{
        // console.log(req.sessionID)
        //로그인상태인 경우 session에 저장된 member_no값 변수에 저장
        const member_no = req.session.user?.member_no;
        const query = req.get('query');
        const page = req.get('page', 1);
        const rows = req.get('rows', 10);

        const params = {};
        if (query) {
            params.title = query;
            params.introduction = query;
            params.alltag = query;
            params.tag = query;
        }
        if (member_no){
            params.member_no = member_no;
        }

        let json = null;
        let pageInfo = null;

        try {
            const totalCount = await accomService.selectCountAll(params);
            pageInfo = pagenation(totalCount, page, rows);
            
            params.offset = pageInfo.offset;
            params.listCount = pageInfo.listCount;
            json = await accomService.selectList(params);
        } catch (err) {
            return next(err);
        }

        res.sendResult({pagenation: pageInfo, item: json});
    });


    // 여행지 단일행 조회
    router.get(`${url}/:accom_no`, async (req, res, next) => {
        const accom_no = req.get("accom_no");

        try {
            regexHelper.value(accom_no, "관광지번호가 없습니다.");
            regexHelper.num(accom_no, "관광지 번호는 숫자입니다.");
        } catch (err) {
            return next(err);
        }

        let json = null;

        try {
            json = await accomService.selectItem({
                accom_no: accom_no,
            });
        } catch (err) {
            return next(err);
        }
        res.sendResult({ item: json });
    });

    return router;
};

export default AccomController;
