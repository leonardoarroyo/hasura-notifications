declare namespace Express {
   export interface Request {
      hasura: import('./sessionToken').SessionToken.Claims
   }
}
