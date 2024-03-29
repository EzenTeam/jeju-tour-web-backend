// import DBPool from '../helper/DBPool.js';
import RuntimeException from '../exceptions/RuntimeException.js';

import {join, resolve} from 'path';
import dotenv from 'dotenv';
import mysql2 from 'mysql2/promise';
// import logger from './LogHelper.js';

dotenv.config({path: join(resolve(), "../config.env")});

/**DATABASE Connection Pool을 관리하기 위한 SingleTon 클래스 */
class DBPool {
    //싱글톤 객체를 담을 비어있는 정적(static)변수 정의
    static current = null;

    //DB접속정보 설정
    static connectionInfo = {
        host : "localhost",    //mysql 서버주소(다른 pc인 경우 IT주소)
        port : 3306,              //mysql 포트번호
        user : "jeju",            //mysql의 로그인 할 수 있는 계정이름
        password : "",  //비밀번호
        database: "jeju",         //사용하고자하는 데이터베이스 이름
        connectionLimit : 10,     //최대 커넥션수
        connectTimeout : 2000,    //커넥션 타임아웃
        waitForConnections : true // 커넥션 풀이 다 찬 경우 처리
    }

    //싱글톤 객체를 생성하여 리턴하는 메서드 정의
    static getInstance(){
        if(DBPool.current == null){
            DBPool.current = new DBPool();
        }
        return DBPool.current;
    };

    //생성자함수 정의
    //데이터베이스 Connection Pool을 생성하고 필요한 이벤트를 정의한다.
    //각이벤트는 DBConnection의 생성,임대,반납 여부를 모니터링하고
    //데이터베이스에 접속되었을 경우 DB에 전달되는 SQL문을 가로채서 로그로 기록을 남기는 기능을 구현하낟.
    constructor(){
        //Connection pool 객체를 멤버변수로서 생성
        this.pool = mysql2.createPool(DBPool.connectionInfo);

        //데이터베이스에 접속됬을때 발생할 이벤트
        this.pool.on('connection', (connection)=>{
            // logger.info('---------------------------------------------------')
            // logger.info(`>> DATABASE 접속됨 [threaId=${connection.threadId}]`);

            //이 객체로 전달되는 SQL수행 함수 기능을 가로챔
            const oldQuery = connection.query;

            //가로챈 객체의 기능을 로그기록 후 SQL을 수행하도록 함수재정의
            connection.query = function(...args){
                const queryCmd = oldQuery.apply(connection,args);
                
                //로그기록의 가독성을 위하여
                //sql문에 포함된 모든 줄바꿈문자를 띄어쓰기로 변환
                //sql문 포한된 2회 연속 공백 문자를 하나의 공백으로 변환
                //trim메서드가 안되면 정규식으로,, 이것도 안되면 다른 정규식.... 다 적용될 수 있도록...
                // logger.debug(queryCmd.sql.trim().replace(/\n/g, " ").replace(/ +(?= )/g, " ").replace(/\s+/g,' '));
                return queryCmd;
            };
        });

        this.pool.on('acquire', (connection)=>{
            // logger.info(`>> Connection 임대됨 [threaId=${connection.threadId}]`);
        })

        this.pool.on('release', (connection)=>{
            // logger.info(`>> Connection 반납됨 [threaId=${connection.threadId}]`);
            // logger.info('---------------------------------------------------')
        })
    };

    //Connection Pool에서 하나의 데이터베이스 접속객체를 임대하는 메서드
    async getConnection(){
        let dbcon = null;

        try {
                        //정의한 메서드 이름만 동일한거
            dbcon = await this.pool.getConnection();
        } catch (err) {   
            //임대한 자원이 있다면 반드시 반납해야 함
            if(dbcon){dbcon.release();}
            // logger.error(err);
            throw err;
        }
        return dbcon;
    };

    //데이터베이스 커넥션풀을 종료함
    close(){
        this.pool.end();
    }
}
   
    const DBPoolInstance = DBPool.getInstance();

    //임시...place여행정보에 사진경로 추가===================================
    async function insertImage(params){
        let dbcon = null;
        let data =null;

        try {
            dbcon = await DBPoolInstance.getConnection();

            //데이터 수정
            let count = 1;
            for(let i=0; i<60; i++){
                let sql = `update accoms set image="tourinfo/accom${count}.jpeg" where accom_no=${count}`;
                let [{insertId, affectedRows}] = await dbcon.query(sql);
                count++;
            }
            if(affectedRows === 0){
                throw new RuntimeException('[여행지 정보추가] 저장된 데이터가 없습니다.')
            }

            console.log(`사진파일 경로 ${count}개 추가 완료!`)
        } catch (error) {
            throw error;
        }finally{
            if(dbcon){dbcon.release()};
        }
        return;
    }
    insertImage()